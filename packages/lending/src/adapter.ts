import { BaseFields, BaseParams } from './adapter.type';
import { Portfolio } from './protocol.portfolio';
import { Protocol, ProtocolClass } from './protocol';
import { Swaper, SwaperClass } from './swaper';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import { defaultInterestRateMode, defaultSlippage } from './protocol.type';
import flatten from 'lodash/flatten';
import { providers } from 'ethers';
import { wrapToken } from './helper';

type Options = {
  permitType: api.Permit2Type | undefined;
  apiKey?: string | undefined;
};
export class Adapter extends common.Web3Toolkit {
  static Protocols: ProtocolClass[] = [];

  static registerProtocol(protocol: ProtocolClass) {
    this.Protocols.push(protocol);
  }

  static Swapers: SwaperClass[] = [];

  static registerSwaper(swaper: SwaperClass) {
    this.Swapers.push(swaper);
  }

  permitType: api.Permit2Type | undefined = 'permit';
  apiKey: string | undefined;
  protocolMap: Record<string, Protocol> = {};
  swapers: Swaper[] = [];

  constructor(
    chainId: number,
    provider: providers.Provider,
    { permitType, apiKey }: Options = { permitType: 'permit' }
  ) {
    super(chainId, provider);
    if (permitType) this.permitType = permitType;
    if (apiKey) this.apiKey = apiKey;

    for (const Protocol of Adapter.Protocols) {
      if (Protocol.isSupported(this.chainId)) {
        const protocol = new Protocol(chainId, provider);
        this.protocolMap[protocol.id] = protocol;
      }
    }
    for (const Swaper of Adapter.Swapers) {
      if (Swaper.isSupported(this.chainId)) {
        this.swapers.push(new Swaper(chainId, provider));
      }
    }
  }

  get protocolIds() {
    return Object.keys(this.protocolMap);
  }

  findSwaper(tokenOrTokens: common.Token | common.Token[]) {
    const canCustomTokenSwappers: Swaper[] = [];
    const tokensSupportedSwappers: Swaper[] = [];
    let bestSwaper: Swaper | undefined;
    for (const swaper of this.swapers) {
      if (swaper.canCustomToken) {
        canCustomTokenSwappers.push(swaper);
      }

      const isNotSupported = Array.isArray(tokenOrTokens)
        ? tokenOrTokens.some((token) => !swaper.isSupportedToken(token))
        : !swaper.isSupportedToken(tokenOrTokens);
      if (isNotSupported) {
        continue;
      }
      tokensSupportedSwappers.push(swaper);

      bestSwaper = swaper;
      break;
    }
    if (!bestSwaper) {
      bestSwaper = tokensSupportedSwappers[0] ?? canCustomTokenSwappers[0];
    }
    if (!bestSwaper) {
      bestSwaper = this.swapers[0];
    }

    return bestSwaper;
  }

  async getPortfolios(account: string): Promise<Portfolio[]> {
    const portfolios = await Promise.all(
      Object.values(this.protocolMap).map((protocol) => protocol.getPortfolios(account))
    );
    return flatten(portfolios);
  }

  async getPortfolio(account: string, protocolId: string, _marketId: string) {
    return await this.protocolMap[protocolId].getPortfolio(account, _marketId);
  }

  getProtocol(id: string) {
    return this.protocolMap[id];
  }

  // tokenA: USDC, tokenB: USDT
  // 1. flashloan USDC
  // 2. swap USDC to USDT
  // 3. deposit USDT, get aUSDT
  // 4. return-funds aUSDT to user
  // 5. add-funds aUSDC to router
  // 6. withdraw aUSDC, get USDC
  // 7. flashloan repay USDC
  async getCollateralSwap(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const collateralSwapLogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await api.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      repays: [{ token: wrappedSrcToken, amount: srcAmount }],
      protocolId: protocolId,
    });

    const flashLoanTokenAmount = flashLoanAggregatorQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = api.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    collateralSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swaper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
      slippage: defaultSlippage,
    });

    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    collateralSwapLogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId });

    collateralSwapLogics.push(supplyLogic);

    afterPortfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // compound v3 base token supplied not support collateral swap
    if (protocolId === 'compoundv3' && supplyLogic.fields.output)
      throw new Error('Compound V3 does not support the base token for performing collateral swaps');

    // if not compound v3, compound v3 does not need return and add funds in collateral swap flow
    if (protocolId !== 'compoundv3') {
      if (!supplyLogic.fields.output) throw new Error('incorrect supply result');
      // ---------- return funds ----------
      const returnLogic = api.protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      collateralSwapLogics.push(returnLogic);

      // ---------- add funds ----------
      const addLogic = api.protocols.permit2.newPullTokenLogic({
        input: new common.TokenAmount(protocol.toProtocolToken(wrappedSrcToken), srcAmount),
      });
      collateralSwapLogics.push(addLogic);
    }

    // ---------- withdraw ----------
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(wrappedSrcToken, srcAmount),
      marketId,
    });
    collateralSwapLogics.push(withdrawLogic);

    afterPortfolio.withdraw(wrappedSrcToken, srcAmount);

    // ---------- flashloan repay ----------
    collateralSwapLogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: collateralSwapLogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>,
      apiKey?: string
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest(
        { ...args, chainId: this.chainId, account, logics: collateralSwapLogics },
        apiKey ? { 'x-api-key': apiKey } : undefined
      );

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
        destAmount: withdrawLogic.fields.output.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: collateralSwapLogics,
    };
  }

  // tokenA: USDC, tokenB: USDT
  // 1. flashloan USDT
  // 2. swap USDT to USDC
  // 3. repay USDC
  // 4. borrow USDT
  // 5. flashloan repay USDT
  async getDebtSwap(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);

    const debtSwapLogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    // get the quotation for how much dest token is needed to exchange for the src amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({ input: swapQuotation.input, tokenOut: srcToken, slippage: defaultSlippage });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await api.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });
    const [flashLoanLoanLogic, flashLoanRepayLogic] = api.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    debtSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    debtSwapLogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      input: swapQuotation.output,
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    debtSwapLogics.push(repayLogic);
    afterPortfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
    });
    debtSwapLogics.push(borrowLogic);
    afterPortfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    debtSwapLogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: debtSwapLogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: debtSwapLogics });

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
        destAmount: borrowTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: debtSwapLogics,
    };
  }

  // Leverage
  // tokenA: WBTC
  // 1. flashloan USDC
  // 2. swap USDC to WBTC
  // 3. deposit WBTC, get aWBTC
  // 4. return funds aWBTC to user
  // 5. borrow USDC
  // 6. flashloan repay USDC
  // * srcToken => depositToken, collateralToken
  // * destToken => flashloanToken, borrowToken
  /**
   * params' srcToken is which user want to long(collateral token), destToken is flashloan token(borrow token)
   * @param protocolId
   * @param marketId
   * @param params
   * @param account
   * @param portfolio
   * @returns
   */
  async getLeverageLong(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);

    const leverageLonglogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedDestToken, wrappedSrcToken]);
    // retrieve the amount needed to borrow based on the collateral token and amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({
      input: swapQuotation.input,
      tokenOut: wrappedSrcToken,
      slippage: defaultSlippage,
    });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await api.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });

    const [flashLoanLoanLogic, flashLoanRepayLogic] = api.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );

    leverageLonglogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    leverageLonglogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId });
    leverageLonglogics.push(supplyLogic);
    afterPortfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    if (supplyLogic.fields.output) {
      const returnLogic = api.protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      leverageLonglogics.push(returnLogic);
    }

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[swapQuotation.input.token.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    leverageLonglogics.push(borrowLogic);

    afterPortfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageLonglogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: leverageLonglogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: leverageLonglogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: leverageLonglogics,
    };
  }

  // tokenA: WBTC
  // 1. flashloan WBTC
  // 2. swap WBTC to USDC
  // 3. deposit USDC, get aUSDC
  // 4. return funds aWBTC to user
  // 5. borrow WBTC
  // 6. flashloan repay WBTC
  // * srcToken => flashloanToken, borrowToken
  // * destToken => depositToken, collateralToken
  async getLeverageShort(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const leverageShortlogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await api.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [{ token: wrappedSrcToken, amount: srcAmount }],
    });

    const flashLoanTokenAmount = flashLoanAggregatorQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = api.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    leverageShortlogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swaper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
      slippage: defaultSlippage,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    leverageShortlogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId });
    leverageShortlogics.push(supplyLogic);

    afterPortfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    if (supplyLogic.fields.output) {
      const returnLogic = api.protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      leverageShortlogics.push(returnLogic);
    }

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedSrcToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    leverageShortlogics.push(borrowLogic);

    afterPortfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageShortlogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: leverageShortlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: leverageShortlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: leverageShortlogics,
    };
  }

  // tokenA: WBTC
  // 1. flashloan USDC
  // 2. swap USDC to WBTC
  // 3. repay WBTC
  // 4. add fund rUSDC
  // 5. withdraw USDC by rUSDC
  // 6. flashloan repay WBTC
  // * srcToken => repayToken
  // * destToken => depositToken, collateralToken
  async getDeleverage(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const deleveragelogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedDestToken, wrappedSrcToken]);
    //  get the quotation for how much collateral token is needed to exchange for the repay amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({
      input: swapQuotation.input,
      tokenOut: wrappedSrcToken,
      slippage: defaultSlippage,
    });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await api.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });

    const [flashLoanLoanLogic, flashLoanRepayLogic] = api.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    deleveragelogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    deleveragelogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      input: swapQuotation.output,
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    deleveragelogics.push(repayLogic);
    afterPortfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- add funds ----------
    if (protocolId !== 'compoundv3') {
      const addLogic = api.protocols.permit2.newPullTokenLogic({
        input: swapQuotation.input,
      });
      deleveragelogics.push(addLogic);
    }

    // ---------- withdraw ----------
    const withdrawTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(wrappedDestToken, withdrawTokenAmount.amount),
      marketId,
    });
    deleveragelogics.push(withdrawLogic);

    // ---------- flashloan repay ----------
    deleveragelogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: deleveragelogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: deleveragelogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: withdrawLogic.fields.output.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: deleveragelogics,
    };
  }

  async getZapSupply(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const zapSupplylogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));

    const afterPortfolio = portfolio.clone();

    let supplyTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- swap ----------
    if (!srcToken.wrapped.is(destToken.wrapped)) {
      const swaper = this.findSwaper([srcToken, destToken]);
      const swapQuotation = await swaper.quote({
        input: { token: srcToken, amount: srcAmount },
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
      supplyTokenAmount = swapQuotation.output;
      zapSupplylogics.push(swapTokenLogic);
    }

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({
      input: supplyTokenAmount,
      marketId,
    });
    zapSupplylogics.push(supplyLogic);

    afterPortfolio.supply(supplyTokenAmount.token, supplyTokenAmount.amount);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapSupplylogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapSupplylogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: supplyTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      logics: zapSupplylogics,
      estimateResult,
      buildRouterTransactionRequest,
    };
  }

  async getZapWithdraw(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const zapWithdrawlogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // init with withdraw token amount
    let outputTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- withdraw ----------
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(srcToken, srcAmount),
      marketId,
    });
    zapWithdrawlogics.push(withdrawLogic);

    afterPortfolio.withdraw(srcToken, withdrawLogic.fields.output.amount);

    // ---------- swap ----------
    if (!srcToken.is(destToken)) {
      const swaper = this.findSwaper([srcToken, destToken]);
      const swapQuotation = await swaper.quote({
        input: withdrawLogic.fields.output,
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      outputTokenAmount = swapQuotation.output;
      const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
      zapWithdrawlogics.push(swapTokenLogic);
    }

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapWithdrawlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapWithdrawlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: outputTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapWithdrawlogics,
    };
  }

  async getZapBorrow(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const zapBorrowlogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // init with borrow token amount
    let outputTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- borrow ----------
    const borrowLogic = protocol.newBorrowLogic({
      output: { token: srcToken, amount: srcAmount },
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    zapBorrowlogics.push(borrowLogic);

    afterPortfolio.borrow(srcToken, srcAmount);

    // ---------- swap ----------
    if (!srcToken.is(destToken)) {
      const swaper = this.findSwaper([srcToken, destToken]);
      const swapQuotation = await swaper.quote({
        input: { token: srcToken, amount: srcAmount },
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      outputTokenAmount = swapQuotation.output;
      const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
      zapBorrowlogics.push(swapTokenLogic);
    }
    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapBorrowlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapBorrowlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,

        destAmount: outputTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapBorrowlogics,
    };
  }

  async getZapRepay(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const zapRepaylogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // init with token in
    let repayTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- swap ----------
    if (!srcToken.wrapped.is(destToken.wrapped)) {
      const swaper = this.findSwaper([srcToken, destToken]);
      const swapQuotation = await swaper.quote({
        input: { token: srcToken, amount: srcAmount },
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      repayTokenAmount = swapQuotation.output;
      const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
      zapRepaylogics.push(swapTokenLogic);
    }
    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      input: new common.TokenAmount(repayTokenAmount.token, repayTokenAmount.amount),
      marketId,
    });

    zapRepaylogics.push(repayLogic);

    afterPortfolio.repay(repayTokenAmount.token, repayTokenAmount.amount);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapRepaylogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapRepaylogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: repayTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapRepaylogics,
    };
  }
}
