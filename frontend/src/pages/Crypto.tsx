import { motion } from 'framer-motion';
import React from 'react';

const Crypto: React.FC = () => {
  const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$43,250', change: '+2.45%', color: 'from-orange-500 to-yellow-500' },
    { name: 'Ethereum', symbol: 'ETH', price: '$2,680', change: '+1.23%', color: 'from-blue-500 to-purple-500' },
    { name: 'Cardano', symbol: 'ADA', price: '$0.52', change: '-0.87%', color: 'from-blue-600 to-blue-700' },
    { name: 'Solana', symbol: 'SOL', price: '$98.45', change: '+5.67%', color: 'from-purple-500 to-pink-500' },
    { name: 'Polkadot', symbol: 'DOT', price: '$7.23', change: '+3.21%', color: 'from-pink-500 to-red-500' },
    { name: 'Chainlink', symbol: 'LINK', price: '$15.67', change: '-1.45%', color: 'from-blue-400 to-cyan-400' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Crypto Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Real-time cryptocurrency data and analytics
          </p>
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { title: 'Market Cap', value: '$2.1T', change: '+3.2%', color: 'from-green-500 to-emerald-500' },
            { title: '24h Volume', value: '$89.5B', change: '+12.4%', color: 'from-blue-500 to-cyan-500' },
            { title: 'BTC Dominance', value: '48.2%', change: '-0.8%', color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-gray-300 text-sm font-medium mb-2">{stat.title}</h3>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Crypto List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Top Cryptocurrencies</h2>
          <div className="space-y-4">
            {cryptoData.map((crypto, index) => (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${crypto.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{crypto.symbol}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{crypto.name}</h3>
                    <p className="text-gray-400 text-sm">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{crypto.price}</div>
                  <span className={`text-sm ${crypto.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trading Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Price Chart</h2>
          <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart component will be integrated here</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Crypto;
