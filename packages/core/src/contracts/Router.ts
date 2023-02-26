/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from './common';

export declare namespace IRouter {
  export type InputStruct = {
    token: PromiseOrValue<string>;
    amountBps: PromiseOrValue<BigNumberish>;
    amountOrOffset: PromiseOrValue<BigNumberish>;
  };

  export type InputStructOutput = [string, BigNumber, BigNumber] & {
    token: string;
    amountBps: BigNumber;
    amountOrOffset: BigNumber;
  };

  export type OutputStruct = {
    token: PromiseOrValue<string>;
    amountMin: PromiseOrValue<BigNumberish>;
  };

  export type OutputStructOutput = [string, BigNumber] & {
    token: string;
    amountMin: BigNumber;
  };

  export type LogicStruct = {
    to: PromiseOrValue<string>;
    data: PromiseOrValue<BytesLike>;
    inputs: IRouter.InputStruct[];
    outputs: IRouter.OutputStruct[];
    approveTo: PromiseOrValue<string>;
    callback: PromiseOrValue<string>;
  };

  export type LogicStructOutput = [
    string,
    string,
    IRouter.InputStructOutput[],
    IRouter.OutputStructOutput[],
    string,
    string
  ] & {
    to: string;
    data: string;
    inputs: IRouter.InputStructOutput[];
    outputs: IRouter.OutputStructOutput[];
    approveTo: string;
    callback: string;
  };
}

export interface RouterInterface extends utils.Interface {
  functions: {
    'execute((address,bytes,(address,uint256,uint256)[],(address,uint256)[],address,address)[],address[])': FunctionFragment;
    'user()': FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: 'execute' | 'user'): FunctionFragment;

  encodeFunctionData(functionFragment: 'execute', values: [IRouter.LogicStruct[], PromiseOrValue<string>[]]): string;
  encodeFunctionData(functionFragment: 'user', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'execute', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'user', data: BytesLike): Result;

  events: {};
}

export interface Router extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RouterInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    execute(
      logics: IRouter.LogicStruct[],
      tokensReturn: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    user(overrides?: CallOverrides): Promise<[string]>;
  };

  execute(
    logics: IRouter.LogicStruct[],
    tokensReturn: PromiseOrValue<string>[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  user(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    execute(
      logics: IRouter.LogicStruct[],
      tokensReturn: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<void>;

    user(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    execute(
      logics: IRouter.LogicStruct[],
      tokensReturn: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    user(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    execute(
      logics: IRouter.LogicStruct[],
      tokensReturn: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    user(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
