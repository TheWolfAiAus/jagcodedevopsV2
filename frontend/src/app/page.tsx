'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store'
import { setUser, setLoading } from '@/lib/slices/authSlice'
import { setCryptoData, setCryptoLoading } from '@/lib/slices/cryptoSlice'
import { authService, databaseService } from '@/lib/appwrite'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: ChartBarIcon,
    title: 'Real-Time Trading',
    description: 'Execute trades with live market data and advanced charting tools'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Portfolio Management',
    description: 'Track your crypto holdings and performance across multiple chains'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Transactions',
    description: 'Bank-level security with multi-signature wallet support'
  },
  {
    icon: GlobeAltIcon,
    title: 'Multi-Chain Support',
    description: 'Trade on Ethereum, Bitcoin, Solana, and other major networks'
  }
]

export default function Home() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const { data: cryptoData } = useSelector((state: RootState) => state.crypto)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    fetchCryptoData()
  }, [])

  const checkAuth = async () => {
    dispatch(setLoading(true))
    try {
      const user = await authService.getCurrentUser()
      if (user) {
        dispatch(setUser(user))
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const fetchCryptoData = async () => {
    dispatch(setCryptoLoading(true))
    try {
      const response = await databaseService.getCryptoData()
      if (response.documents.length > 0) {
        dispatch(setCryptoData(response.documents[0]))
      }
    } catch (error) {
      console.error('Failed to fetch crypto data:', error)
    } finally {
      dispatch(setCryptoLoading(false))
    }
  }

  if (!mounted) {
    return null
  }

  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            <SparklesIcon className="inline w-8 h-8 mr-2 text-purple-400" />
            JagCodeDevOps
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-x-4"
          >
            <Link
              href="/login"
              className="px-4 py-2 text-white hover:text-purple-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-white mb-6">
            The Future of
            <span className="block gradient-text">Crypto Trading</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Experience lightning-fast trades, real-time market data, and advanced portfolio management 
            in one comprehensive platform designed for the modern crypto trader.
          </p>
          
          {/* Real-time Crypto Prices */}
          {cryptoData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center space-x-8 mb-12"
            >
              <div className="crypto-card p-6">
                <div className="text-sm text-gray-400 mb-2">Bitcoin</div>
                <div className="text-2xl font-bold text-white flex items-center">
                  ${cryptoData.bitcoin_price?.toLocaleString()}
                  <ArrowTrendingUpIcon className="w-5 h-5 ml-2 text-green-400" />
                </div>
              </div>
              <div className="crypto-card p-6">
                <div className="text-sm text-gray-400 mb-2">Ethereum</div>
                <div className="text-2xl font-bold text-white flex items-center">
                  ${cryptoData.ethereum_price?.toLocaleString()}
                  <ArrowTrendingUpIcon className="w-5 h-5 ml-2 text-green-400" />
                </div>
              </div>
              <div className="crypto-card p-6">
                <div className="text-sm text-gray-400 mb-2">Solana</div>
                <div className="text-2xl font-bold text-white flex items-center">
                  ${cryptoData.solana_price?.toLocaleString()}
                  <ArrowTrendingUpIcon className="w-5 h-5 ml-2 text-green-400" />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-x-6"
          >
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition-all transform hover:scale-105"
            >
              Start Trading Now
              <ArrowTrendingUpIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 border border-purple-400 text-purple-400 text-lg font-semibold rounded-xl hover:bg-purple-400 hover:text-white transition-all"
            >
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-32"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose JagCodeDevOps?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="crypto-card p-8 text-center"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}