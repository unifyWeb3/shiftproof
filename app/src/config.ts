/**
 * wagmi configuration — chain built dynamically from ACTIVE_NETWORK.
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'viem/chains'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { ACTIVE_NETWORK } from './lib/networks'
import { registerChain } from './tracing'

// Build a viem chain object from the active network config.
const arcChain = defineChain({
  id: ACTIVE_NETWORK.chainId,
  name: ACTIVE_NETWORK.label,
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: ACTIVE_NETWORK.nativeDecimals,
  },
  rpcUrls: {
    default: { http: [ACTIVE_NETWORK.rpcUrl] },
  },
  blockExplorers: {
    default: { name: `${ACTIVE_NETWORK.label} Explorer`, url: ACTIVE_NETWORK.explorerUrl },
  },
  testnet: ACTIVE_NETWORK.isTestnet,
})

registerChain(arcChain.id, ACTIVE_NETWORK.rpcUrl)

export const config = createConfig({
  chains: [arcChain, mainnet], // mainnet for ENS resolution only
  connectors: [injected()],
  transports: {
    [arcChain.id]: http(),
    [mainnet.id]: http(),
  },
})
