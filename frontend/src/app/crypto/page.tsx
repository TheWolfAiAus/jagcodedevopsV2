'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { useRealTimeCrypto } from '@/lib/hooks/useRealTimeData'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const cryptoList = [
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    key: 'bitcoin_price',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    key: 'ethereum_price',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  { 
    symbol: 'SOL', 
    name: 'Solana', 
    key: 'solana_price',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
]

export default function Crypto() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { data: cryptoData } = useSelector((state: RootState) => state.crypto)
  const { data: realTimeCrypto, isLoading } = useRealTimeCrypto()
  
  const [mounted, setMounted] = useState(false)
  const [priceChanges, setPriceChanges] = useState<{[key: string]: number}>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (realTimeCrypto && cryptoData) {
      const changes: {[key: string]: number} = {}
      cryptoList.forEach(crypto => {
        const current = realTimeCrypto[crypto.key as keyof typeof realTimeCrypto] as number
        const previous = cryptoData[crypto.key as keyof typeof cryptoData] as number
        if (current && previous) {
          changes[crypto.key] = ((current - previous) / previous) * 100
        }
      })
      setPriceChanges(changes)
    }
  }, [realTimeCrypto, cryptoData])

  if (!mounted) return null

  const currentData = realTimeCrypto || cryptoData

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
                <Link href="/crypto" className="text-purple-400 font-semibold">
                  Markets
                </Link>
                <Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
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
            <ChartBarIcon className="w-10 h-10 mr-3 text-purple-400" />
            Crypto Markets
            {isLoading && (
              <div className="ml-3 animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            )}
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time cryptocurrency prices and market data
          </p>
          {currentData?.last_updated && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 mr-1" />
              Last updated: {new Date(currentData.last_updated).toLocaleString()}
            </div>
          )}
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {cryptoList.map((crypto, index) => {
            const price = currentData?.[crypto.key as keyof typeof currentData] as number
            const change = priceChanges[crypto.key] || 0
            const isPositive = change >= 0

            return (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="crypto-card p-6 hover:scale-105 transition-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${crypto.bgColor} rounded-full flex items-center justify-center`}>
                      <span className={`text-lg font-bold ${crypto.color}`}>
                        {crypto.symbol}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{crypto.name}</h3>
                      <p className="text-sm text-gray-400">{crypto.symbol}</p>
                    </div>
                  </div>
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">
                    ${price?.toLocaleString() || 'N/A'}
                  </div>
                  {change !== 0 && (
                    <div className={`flex items-center text-sm ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(change).toFixed(2)}%
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Trade {crypto.symbol}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Market Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="crypto-card p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-purple-400" />
            Market Statistics
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Total Market Cap</div>
              <div className="text-2xl font-bold text-white">
                ${currentData ? (
                  (currentData.bitcoin_price * 19.7 + 
                   currentData.ethereum_price * 120.4 + 
                   currentData.solana_price * 465).toLocaleString(undefined, { maximumFractionDigits: 0 })
                ) : 'N/A'}M
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">24h Volume</div>
              <div className="text-2xl font-bold text-white">$1.2B</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Active Traders</div>
              <div className="text-2xl font-bold text-white">12.5K</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Market Dominance</div>
              <div className="text-2xl font-bold text-white">BTC 42%</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <div className="crypto-card p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Start Trading Today
              </h3>
              <p className="text-gray-400 mb-6">
                Join thousands of traders using our platform for crypto trading
              </p>
              <div className="space-x-4">
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-purple-400 text-purple-400 font-semibold rounded-lg hover:bg-purple-400 hover:text-white transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}