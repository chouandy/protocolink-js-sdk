/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { Agent, AgentInterface } from '../Agent';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wrappedNative_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'permit2_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'Initialized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidBps',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'selector',
        type: 'bytes4',
      },
    ],
    name: 'InvalidPermit2Data',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPermitCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotCallback',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotRouter',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnresetCallbackWithCharge',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'i',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'j',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AmountReplaced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'collector',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'metadata',
        type: 'bytes32',
      },
    ],
    name: 'Charged',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'permit2Datas',
        type: 'bytes[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'balanceBps',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountOrOffset',
                type: 'uint256',
              },
            ],
            internalType: 'struct DataType.Input[]',
            name: 'inputs',
            type: 'tuple[]',
          },
          {
            internalType: 'enum DataType.WrapMode',
            name: 'wrapMode',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'callback',
            type: 'address',
          },
        ],
        internalType: 'struct DataType.Logic[]',
        name: 'logics',
        type: 'tuple[]',
      },
      {
        internalType: 'address[]',
        name: 'tokensReturn',
        type: 'address[]',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'balanceBps',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountOrOffset',
                type: 'uint256',
              },
            ],
            internalType: 'struct DataType.Input[]',
            name: 'inputs',
            type: 'tuple[]',
          },
          {
            internalType: 'enum DataType.WrapMode',
            name: 'wrapMode',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'callback',
            type: 'address',
          },
        ],
        internalType: 'struct DataType.Logic[]',
        name: 'logics',
        type: 'tuple[]',
      },
    ],
    name: 'executeByCallback',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'permit2Datas',
        type: 'bytes[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'balanceBps',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountOrOffset',
                type: 'uint256',
              },
            ],
            internalType: 'struct DataType.Input[]',
            name: 'inputs',
            type: 'tuple[]',
          },
          {
            internalType: 'enum DataType.WrapMode',
            name: 'wrapMode',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'callback',
            type: 'address',
          },
        ],
        internalType: 'struct DataType.Logic[]',
        name: 'logics',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'metadata',
            type: 'bytes32',
          },
        ],
        internalType: 'struct DataType.Fee[]',
        name: 'fees',
        type: 'tuple[]',
      },
      {
        internalType: 'bytes32[]',
        name: 'referrals',
        type: 'bytes32[]',
      },
      {
        internalType: 'address[]',
        name: 'tokensReturn',
        type: 'address[]',
      },
    ],
    name: 'executeWithSignerFee',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isCharging',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC721Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'permit2',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'router',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wrappedNative',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class Agent__factory {
  static readonly abi = _abi;
  static createInterface(): AgentInterface {
    return new utils.Interface(_abi) as AgentInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Agent {
    return new Contract(address, _abi, signerOrProvider) as Agent;
  }
}
