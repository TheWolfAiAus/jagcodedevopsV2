'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/lib/store'
import { setUser, clearUser } from '@/lib/slices/authSlice'
import { authService } from '@/lib/appwrite'
import { useRealTimeCrypto, useRealTimePortfolio } from '@/lib/hooks/useRealTimeData'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const { data: cryptoData } = useSelector((state: RootState) => state.crypto)
  
  const [mounted, setMounted] = useState(false)
  
  // Real-time data hooks
  const { data: realTimeCrypto, isLoading: cryptoLoading } = useRealTimeCrypto()
  const { transactions, isLoading: portfolioLoading } = useRealTimePortfolio(user?.$id || '')

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        dispatch(setUser(currentUser))
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      dispatch(clearUser())
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const currentCrypto = realTimeCrypto || cryptoData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.name}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Real-Time Crypto Prices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-purple-400" />
            Real-Time Market Data
            {cryptoLoading && (
              <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
            )}
          </h2>
          
          {currentCrypto ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="crypto-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Bitcoin</h3>
                    <p className="text-sm text-gray-400">BTC</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  ${currentCrypto.bitcoin_price?.toLocaleString() || 'N/A'}
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-gray-400">
                    {currentCrypto.last_updated ? new Date(currentCrypto.last_updated).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="crypto-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Ethereum</h3>
                    <p className="text-sm text-gray-400">ETH</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  ${currentCrypto.ethereum_price?.toLocaleString() || 'N/A'}
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-gray-400">
                    {currentCrypto.last_updated ? new Date(currentCrypto.last_updated).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="crypto-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Solana</h3>
                    <p className="text-sm text-gray-400">SOL</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  ${currentCrypto.solana_price?.toLocaleString() || 'N/A'}
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-gray-400">
                    {currentCrypto.last_updated ? new Date(currentCrypto.last_updated).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="crypto-card p-8 text-center">
              <div className="text-gray-400">Loading market data...</div>
            </div>
          )}
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-purple-400" />
            Portfolio Overview
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="crypto-card p-6">
              <h3 className="text-sm text-gray-400 mb-2">Total Balance</h3>
              <div className="text-2xl font-bold text-white">$0.00</div>
            </div>
            <div className="crypto-card p-6">
              <h3 className="text-sm text-gray-400 mb-2">24h Change</h3>
              <div className="text-2xl font-bold text-green-400 flex items-center">
                +0.00%
                <ArrowTrendingUpIcon className="w-5 h-5 ml-1" />
              </div>
            </div>
            <div className="crypto-card p-6">
              <h3 className="text-sm text-gray-400 mb-2">Active Positions</h3>
              <div className="text-2xl font-bold text-white">0</div>
            </div>
            <div className="crypto-card p-6">
              <h3 className="text-sm text-gray-400 mb-2">Total Trades</h3>
              <div className="text-2xl font-bold text-white">{transactions.length}</div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
          
          <div className="crypto-card overflow-hidden">
            {portfolioLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {transactions.slice(0, 10).map((transaction, index) => (
                      <tr key={transaction.$id}>
                        <td className="px-6 py-4 text-white capitalize">{transaction.type}</td>
                        <td className="px-6 py-4 text-white">{transaction.amount}</td>
                        <td className="px-6 py-4 text-white uppercase">{transaction.symbol}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400">No transactions found</p>
                <p className="text-sm text-gray-500 mt-2">Start trading to see your transaction history</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}