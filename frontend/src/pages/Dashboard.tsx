import {motion} from 'framer-motion';
import React from 'react';

const Dashboard: React.FC = () => {
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
            Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Welcome to your JagCodeDevOps dashboard
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { title: 'Total Projects', value: '12', color: 'from-blue-500 to-cyan-500' },
            { title: 'Active Tasks', value: '8', color: 'from-green-500 to-emerald-500' },
            { title: 'Team Members', value: '6', color: 'from-purple-500 to-pink-500' },
            { title: 'Completed', value: '24', color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} mb-4 flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{stat.value}</span>
              </div>
              <h3 className="text-gray-300 text-sm font-medium">{stat.title}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              'Project Alpha deployment completed',
              'New team member joined',
              'Code review requested',
              'Database backup scheduled',
              'API endpoint updated'
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">{activity}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
