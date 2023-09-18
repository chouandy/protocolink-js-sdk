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
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result, EventFragment } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common';

export declare namespace DataType {
  export type InputStruct = {
    token: string;
    balanceBps: BigNumberish;
    amountOrOffset: BigNumberish;
  };

  export type InputStructOutput = [string, BigNumber, BigNumber] & {
    token: string;
    balanceBps: BigNumber;
    amountOrOffset: BigNumber;
  };

  export type LogicStruct = {
    to: string;
    data: BytesLike;
    inputs: DataType.InputStruct[];
    wrapMode: BigNumberish;
    approveTo: string;
    callback: string;
  };

  export type LogicStructOutput = [string, string, DataType.InputStructOutput[], number, string, string] & {
    to: string;
    data: string;
    inputs: DataType.InputStructOutput[];
    wrapMode: number;
    approveTo: string;
    callback: string;
  };

  export type FeeStruct = {
    token: string;
    amount: BigNumberish;
    metadata: BytesLike;
  };

  export type FeeStructOutput = [string, BigNumber, string] & {
    token: string;
    amount: BigNumber;
    metadata: string;
  };
}

export interface AgentInterface extends utils.Interface {
  functions: {
    'execute(bytes[],(address,bytes,(address,uint256,uint256)[],uint8,address,address)[],address[])': FunctionFragment;
    'executeByCallback((address,bytes,(address,uint256,uint256)[],uint8,address,address)[])': FunctionFragment;
    'executeWithSignerFee(bytes[],(address,bytes,(address,uint256,uint256)[],uint8,address,address)[],(address,uint256,bytes32)[],bytes32[],address[])': FunctionFragment;
    'initialize()': FunctionFragment;
    'isCharging()': FunctionFragment;
    'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)': FunctionFragment;
    'onERC1155Received(address,address,uint256,uint256,bytes)': FunctionFragment;
    'onERC721Received(address,address,uint256,bytes)': FunctionFragment;
    'permit2()': FunctionFragment;
    'router()': FunctionFragment;
    'supportsInterface(bytes4)': FunctionFragment;
    'wrappedNative()': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | 'execute'
      | 'executeByCallback'
      | 'executeWithSignerFee'
      | 'initialize'
      | 'isCharging'
      | 'onERC1155BatchReceived'
      | 'onERC1155Received'
      | 'onERC721Received'
      | 'permit2'
      | 'router'
      | 'supportsInterface'
      | 'wrappedNative'
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'execute', values: [BytesLike[], DataType.LogicStruct[], string[]]): string;
  encodeFunctionData(functionFragment: 'executeByCallback', values: [DataType.LogicStruct[]]): string;
  encodeFunctionData(
    functionFragment: 'executeWithSignerFee',
    values: [BytesLike[], DataType.LogicStruct[], DataType.FeeStruct[], BytesLike[], string[]]
  ): string;
  encodeFunctionData(functionFragment: 'initialize', values?: undefined): string;
  encodeFunctionData(functionFragment: 'isCharging', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'onERC1155BatchReceived',
    values: [string, string, BigNumberish[], BigNumberish[], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: 'onERC1155Received',
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: 'onERC721Received', values: [string, string, BigNumberish, BytesLike]): string;
  encodeFunctionData(functionFragment: 'permit2', values?: undefined): string;
  encodeFunctionData(functionFragment: 'router', values?: undefined): string;
  encodeFunctionData(functionFragment: 'supportsInterface', values: [BytesLike]): string;
  encodeFunctionData(functionFragment: 'wrappedNative', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'execute', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'executeByCallback', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'executeWithSignerFee', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'isCharging', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'onERC1155BatchReceived', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'onERC1155Received', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'onERC721Received', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'permit2', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'router', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'supportsInterface', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'wrappedNative', data: BytesLike): Result;

  events: {
    'AmountReplaced(uint256,uint256,uint256)': EventFragment;
    'Charged(address,uint256,address,bytes32)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'AmountReplaced'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Charged'): EventFragment;
}

export interface AmountReplacedEventObject {
  i: BigNumber;
  j: BigNumber;
  amount: BigNumber;
}
export type AmountReplacedEvent = TypedEvent<[BigNumber, BigNumber, BigNumber], AmountReplacedEventObject>;

export type AmountReplacedEventFilter = TypedEventFilter<AmountReplacedEvent>;

export interface ChargedEventObject {
  token: string;
  amount: BigNumber;
  collector: string;
  metadata: string;
}
export type ChargedEvent = TypedEvent<[string, BigNumber, string, string], ChargedEventObject>;

export type ChargedEventFilter = TypedEventFilter<ChargedEvent>;

export interface Agent extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AgentInterface;

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
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      tokensReturn: string[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    executeByCallback(
      logics: DataType.LogicStruct[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    executeWithSignerFee(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      fees: DataType.FeeStruct[],
      referrals: BytesLike[],
      tokensReturn: string[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    initialize(overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

    isCharging(overrides?: CallOverrides): Promise<[boolean]>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    permit2(overrides?: CallOverrides): Promise<[string]>;

    router(overrides?: CallOverrides): Promise<[string]>;

    supportsInterface(interfaceId: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;

    wrappedNative(overrides?: CallOverrides): Promise<[string]>;
  };

  execute(
    permit2Datas: BytesLike[],
    logics: DataType.LogicStruct[],
    tokensReturn: string[],
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  executeByCallback(
    logics: DataType.LogicStruct[],
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  executeWithSignerFee(
    permit2Datas: BytesLike[],
    logics: DataType.LogicStruct[],
    fees: DataType.FeeStruct[],
    referrals: BytesLike[],
    tokensReturn: string[],
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  initialize(overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

  isCharging(overrides?: CallOverrides): Promise<boolean>;

  onERC1155BatchReceived(
    arg0: string,
    arg1: string,
    arg2: BigNumberish[],
    arg3: BigNumberish[],
    arg4: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  onERC1155Received(
    arg0: string,
    arg1: string,
    arg2: BigNumberish,
    arg3: BigNumberish,
    arg4: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  onERC721Received(
    arg0: string,
    arg1: string,
    arg2: BigNumberish,
    arg3: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  permit2(overrides?: CallOverrides): Promise<string>;

  router(overrides?: CallOverrides): Promise<string>;

  supportsInterface(interfaceId: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  wrappedNative(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    execute(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      tokensReturn: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    executeByCallback(logics: DataType.LogicStruct[], overrides?: CallOverrides): Promise<void>;

    executeWithSignerFee(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      fees: DataType.FeeStruct[],
      referrals: BytesLike[],
      tokensReturn: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    initialize(overrides?: CallOverrides): Promise<void>;

    isCharging(overrides?: CallOverrides): Promise<boolean>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    permit2(overrides?: CallOverrides): Promise<string>;

    router(overrides?: CallOverrides): Promise<string>;

    supportsInterface(interfaceId: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    wrappedNative(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    'AmountReplaced(uint256,uint256,uint256)'(i?: null, j?: null, amount?: null): AmountReplacedEventFilter;
    AmountReplaced(i?: null, j?: null, amount?: null): AmountReplacedEventFilter;

    'Charged(address,uint256,address,bytes32)'(
      token?: string | null,
      amount?: null,
      collector?: string | null,
      metadata?: null
    ): ChargedEventFilter;
    Charged(token?: string | null, amount?: null, collector?: string | null, metadata?: null): ChargedEventFilter;
  };

  estimateGas: {
    execute(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      tokensReturn: string[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    executeByCallback(
      logics: DataType.LogicStruct[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    executeWithSignerFee(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      fees: DataType.FeeStruct[],
      referrals: BytesLike[],
      tokensReturn: string[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    initialize(overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    isCharging(overrides?: CallOverrides): Promise<BigNumber>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    permit2(overrides?: CallOverrides): Promise<BigNumber>;

    router(overrides?: CallOverrides): Promise<BigNumber>;

    supportsInterface(interfaceId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    wrappedNative(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    execute(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      tokensReturn: string[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    executeByCallback(
      logics: DataType.LogicStruct[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    executeWithSignerFee(
      permit2Datas: BytesLike[],
      logics: DataType.LogicStruct[],
      fees: DataType.FeeStruct[],
      referrals: BytesLike[],
      tokensReturn: string[],
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    initialize(overrides?: Overrides & { from?: string }): Promise<PopulatedTransaction>;

    isCharging(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    onERC1155BatchReceived(
      arg0: string,
      arg1: string,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    onERC1155Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    permit2(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    router(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    supportsInterface(interfaceId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    wrappedNative(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
