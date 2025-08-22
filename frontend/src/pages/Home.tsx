import {motion} from 'framer-motion'
import {
    ArrowRight,
    Bitcoin,
    ChevronRight,
    Globe,
    Palette,
    Play,
    Shield,
    Star,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react'
import {useInView} from 'react-intersection-observer'
import {Link} from 'react-router-dom'

const Home = () => {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1, triggerOnce: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const features = [
    {
      icon: Bitcoin,
      title: "Cryptocurrency Trading",
      description: "Advanced trading tools with real-time market data and portfolio management",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Palette,
      title: "NFT Marketplace",
      description: "Discover, collect, and trade unique digital assets on our secure platform",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with multi-layer protection and insurance coverage",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "High-performance infrastructure ensuring instant transactions and updates",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Available worldwide with support for multiple languages and currencies",
      color: "from-indigo-400 to-purple-500"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join our vibrant community of traders, artists, and enthusiasts",
      color: "from-pink-400 to-rose-500"
    }
  ]

  const stats = [
    { number: "10M+", label: "Active Users", icon: Users },
    { number: "$50B+", label: "Trading Volume", icon: TrendingUp },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "150+", label: "Countries", icon: Globe }
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="space-y-8"
          >
            {/* Main Heading */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight"
            >
              <span className="gradient-text">JagCode</span>
              <br />
              <span className="text-white">DevOps</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-xl sm:text-2xl lg:text-3xl text-slate-300 max-w-4xl mx-auto leading-relaxed"
            >
              The future of cryptocurrency trading and NFT collection with 
              <span className="gradient-text font-semibold"> stunning animations</span> and 
              <span className="gradient-text font-semibold"> seamless experiences</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20">
                <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                Watch Demo
              </button>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              variants={itemVariants}
              className="relative mt-16"
            >
              <div className="flex justify-center items-center gap-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ 
                      scale: [0, 1, 0.9, 1],
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-4 h-4 bg-primary-400 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Why Choose <span className="gradient-text">JagCodeDevOps</span>?
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-300 max-w-3xl mx-auto"
            >
              Experience the next generation of digital asset trading with our cutting-edge platform
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="group relative p-8 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                className="text-center group"
              >
                <div className="inline-flex p-4 rounded-full bg-primary-500/20 mb-4 group-hover:bg-primary-500/30 transition-colors duration-300">
                  <stat.icon className="w-8 h-8 text-primary-400" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-sm lg:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            className="space-y-8"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
            >
              Ready to Start Your <span className="gradient-text">Journey</span>?
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Join thousands of users who are already trading and collecting on our platform
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Create Account
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center items-center gap-8 mt-12 text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>10M+ Users</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
