import {motion} from 'framer-motion';
import React from 'react';

const NFTs: React.FC = () => {
  const nftData = [
    { name: 'Cosmic Wolf #001', artist: 'WolfAI', price: '2.5 ETH', image: '🐺', rarity: 'Legendary' },
    { name: 'Digital Dreamscape', artist: 'CryptoArtist', price: '1.8 ETH', image: '🌌', rarity: 'Epic' },
    { name: 'Neon City Lights', artist: 'UrbanCreator', price: '3.2 ETH', image: '🏙️', rarity: 'Rare' },
    { name: 'Mystic Forest', artist: 'NatureNFT', price: '0.9 ETH', image: '🌲', rarity: 'Common' },
    { name: 'Galaxy Explorer', artist: 'SpaceArtist', price: '4.1 ETH', image: '🚀', rarity: 'Legendary' },
    { name: 'Ocean Depths', artist: 'MarineCreator', price: '1.5 ETH', image: '🌊', rarity: 'Epic' }
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
            NFT Gallery
          </h1>
          <p className="text-xl text-gray-300">
            Discover unique digital collectibles and artwork
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { title: 'Total NFTs', value: '1,247', color: 'from-blue-500 to-cyan-500' },
            { title: 'Floor Price', value: '0.8 ETH', color: 'from-green-500 to-emerald-500' },
            { title: 'Total Volume', value: '2,456 ETH', color: 'from-purple-500 to-pink-500' },
            { title: 'Owners', value: '892', color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-gray-300 text-sm font-medium mb-2">{stat.title}</h3>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {nftData.map((nft, index) => (
            <motion.div
              key={nft.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-4">{nft.image}</div>
                <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
                <p className="text-gray-400 mb-2">by {nft.artist}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                  nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
                  nft.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {nft.rarity}
                </span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-4">{nft.price}</div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NFTs;
