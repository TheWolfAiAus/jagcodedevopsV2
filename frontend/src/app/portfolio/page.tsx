'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/lib/store'
import { useRealTimePortfolio } from '@/lib/hooks/useRealTimeData'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Portfolio() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { holdings, totalValue } = useSelector((state: RootState) => state.portfolio)
  
  const [mounted, setMounted] = useState(false)
  const { transactions, isLoading } = useRealTimePortfolio(user?.$id || '')

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!mounted) return null

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  // Mock portfolio data for demonstration
  const mockHoldings = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.5,
      value: 21500,
      price: 43000,
      change: 2.5,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 5.2,
      value: 12400,
      price: 2384,
      change: -1.2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      amount: 100,
      value: 6500,
      price: 65,
      change: 5.8,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ]

  const mockTotalValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0)
  const mockTotalChange = 1.8

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold text-white">
                JagCodeDevOps
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/crypto" className="text-gray-300 hover:text-white transition-colors">
                  Markets
                </Link>
                <Link href="/portfolio" className="text-purple-400 font-semibold">
                  Portfolio
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <Link href="/dashboard" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
            <ChartPieIcon className="w-10 h-10 mr-3 text-purple-400" />
            My Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            Track your crypto investments and performance
          </p>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="crypto-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Portfolio Value</h3>
              <CurrencyDollarIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ${mockTotalValue.toLocaleString()}
            </div>
            <div className={`flex items-center text-sm ${
              mockTotalChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {mockTotalChange >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(mockTotalChange)}% (24h)
            </div>
          </div>

          <div className="crypto-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Holdings</h3>
              <ChartPieIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {mockHoldings.length}
            </div>
            <div className="text-sm text-gray-400">Assets</div>
          </div>

          <div className="crypto-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Best Performer</h3>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-xl font-bold text-white mb-2">SOL</div>
            <div className="text-sm text-green-400">+5.8%</div>
          </div>

          <div className="crypto-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Transactions</h3>
              <ClockIcon className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-400">All time</div>
          </div>
        </motion.div>

        {/* Holdings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="crypto-card p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Holdings</h2>
            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          </div>

          {mockHoldings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 text-sm font-medium text-gray-400">Asset</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">Price</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">Value</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">24h Change</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHoldings.map((holding, index) => (
                    <motion.tr
                      key={holding.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${holding.bgColor} rounded-full flex items-center justify-center`}>
                            <span className={`text-sm font-bold ${holding.color}`}>
                              {holding.symbol}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-white">{holding.name}</div>
                            <div className="text-sm text-gray-400">{holding.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right text-white">{holding.amount}</td>
                      <td className="py-4 text-right text-white">${holding.price.toLocaleString()}</td>
                      <td className="py-4 text-right text-white font-semibold">${holding.value.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <span className={`flex items-center justify-end ${
                          holding.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {holding.change >= 0 ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                          )}
                          {Math.abs(holding.change)}%
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                          Trade
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartPieIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Holdings Yet</h3>
              <p className="text-gray-400 mb-6">Start building your crypto portfolio</p>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Buy Your First Crypto
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="crypto-card p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 text-sm font-medium text-gray-400">Type</th>
                    <th className="text-left py-4 text-sm font-medium text-gray-400">Asset</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-right py-4 text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction, index) => (
                    <tr key={transaction.$id} className="border-b border-white/5">
                      <td className="py-4 text-white capitalize">{transaction.type}</td>
                      <td className="py-4 text-white uppercase">{transaction.symbol}</td>
                      <td className="py-4 text-right text-white">{transaction.amount}</td>
                      <td className="py-4">
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
                      <td className="py-4 text-right text-gray-400">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
              <p className="text-gray-400">Your transaction history will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}