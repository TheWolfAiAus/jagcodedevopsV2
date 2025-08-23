import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Wallet, Shield, Zap } from 'lucide-react';
import { authService, functionsService } from '../lib/appwrite';

export default function Home() {
  const [cryptoData, setCryptoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCryptoData();
  }, []);

  const loadCryptoData = async () => {
    try {
      const response = await functionsService.executeBackendAPI('/api/crypto/prices');
      setCryptoData(response);
    } catch (error) {
      console.error('Failed to load crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>JagCodeDevOps - Advanced Crypto & DeFi Platform</title>
        <meta name="description" content="Professional cryptocurrency trading, DeFi analytics, and NFT marketplace platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="relative overflow-hidden">
          <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-cyan-400"
            >
              JagCodeDevOps
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex space-x-4"
            >
              <button className="px-6 py-2 border border-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-colors">
                Sign In
              </button>
              <button className="px-6 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors">
                Get Started
              </button>
            </motion.div>
          </nav>

          {/* Hero Section */}
          <section className="container mx-auto px-6 py-20 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              Advanced Crypto
              <br />
              Trading Platform
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Professional-grade cryptocurrency trading, DeFi analytics, NFT marketplace, 
              and portfolio management in one powerful platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center">
                Start Trading <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 border border-gray-600 rounded-lg font-semibold text-lg hover:border-cyan-400 transition-colors">
                View Portfolio
              </button>
            </motion.div>
          </section>
        </header>

        {/* Live Crypto Data */}
        {!loading && cryptoData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="container mx-auto px-6 py-16"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-center">Live Market Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(cryptoData).map(([coin, data]: [string, any]) => (
                  <div key={coin} className="bg-gray-900/50 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold capitalize">{coin}</h3>
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 mb-2">
                      ${data.usd?.toLocaleString()}
                    </div>
                    <div className={`text-sm ${data.usd_24h_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.usd_24h_change > 0 ? '+' : ''}{data.usd_24h_change?.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Platform Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Wallet className="w-8 h-8" />,
                title: "Multi-Chain Wallet",
                description: "Connect and manage wallets across Ethereum, BSC, Polygon, and more"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Advanced Analytics",
                description: "Real-time portfolio tracking, P&L analysis, and market insights"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Trading",
                description: "Enterprise-grade security with 2FA and hardware wallet support"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "DeFi Integration",
                description: "Access to DEXs, yield farming, and liquidity pools"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-cyan-400 transition-colors"
              >
                <div className="text-cyan-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl p-12 border border-cyan-400/30"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders using our platform for professional cryptocurrency trading and DeFi operations.
            </p>
            <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105">
              Create Account Now
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2024 JagCodeDevOps. All rights reserved.</p>
            <p className="mt-2">Professional cryptocurrency trading platform</p>
          </div>
        </footer>
      </main>
    </>
  );
}