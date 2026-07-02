import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'

export const useWeb3Auth = () => {
  const { address, addresses, isConnected, connector, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const handleConnect = (connector) => {
    connect({ connector: connector || injected() })
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return {
    address,
    addresses,
    isConnected,
    connector,
    isPending,
    connectors,
    chainId,
    switchChain,
    connect: handleConnect,
    disconnect: handleDisconnect,
  }
}
