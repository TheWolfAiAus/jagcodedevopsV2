import { motion } from 'framer-motion';
import React from 'react';

const Portfolio: React.FC = () => {
  const portfolioData = {
    totalValue: '$24,567.89',
    totalChange: '+12.45%',
    assets: [
      { name: 'Bitcoin', symbol: 'BTC', amount: '0.45', value: '$19,350.00', change: '+8.23%', color: 'from-orange-500 to-yellow-500' },
      { name: 'Ethereum', symbol: 'ETH', amount: '2.1', value: '$5,628.00', change: '+15.67%', color: 'from-blue-500 to-purple-500' },
      { name: 'Cardano', symbol: 'ADA', amount: '1500', value: '$780.00', change: '-2.34%', color: 'from-blue-600 to-blue-700' },
      { name: 'Solana', symbol: 'SOL', amount: '12.5', value: '$1,230.50', change: '+22.45%', color: 'from-purple-500 to-pink-500' },
      { name: 'Polkadot', symbol: 'DOT', amount: '45', value: '$325.50', change: '+5.67%', color: 'from-pink-500 to-red-500' }
    ]
  };

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
            Portfolio
          </h1>
          <p className="text-xl text-gray-300">
            Track your digital assets and performance
          </p>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Total Portfolio Value</h2>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {portfolioData.totalValue}
            </div>
            <div className={`text-xl ${portfolioData.totalChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.totalChange}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                Buy
              </button>
              <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300">
                Sell
              </button>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                Transfer
              </button>
            </div>
          </div>
        </motion.div>

        {/* Asset List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Assets</h2>
          <div className="space-y-4">
            {portfolioData.assets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${asset.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{asset.symbol}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{asset.name}</h3>
                    <p className="text-gray-400 text-sm">{asset.amount} {asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{asset.value}</div>
                  <span className={`text-sm ${asset.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Performance Chart</h2>
          <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Portfolio performance chart will be integrated here</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Portfolio;
