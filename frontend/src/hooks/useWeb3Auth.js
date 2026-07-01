import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export const useWeb3Auth = () => {
  const { address, addresses, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

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
    connect: handleConnect,
    disconnect: handleDisconnect,
  }
}
