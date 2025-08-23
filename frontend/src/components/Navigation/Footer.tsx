import {motion} from 'framer-motion'
import {Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter} from 'lucide-react'
import {Link} from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'API', href: '/api' },
        { name: 'Documentation', href: '/docs' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact', href: '/contact' },
        { name: 'Status', href: '/status' },
        { name: 'Community', href: '/community' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Compliance', href: '/compliance' },
      ]
    }
  ]

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/jagcodedeveops' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/jagcodedeveops' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/jagcodedeveops' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/jagcodedeveops' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/jagcodedeveops' },
  ]

  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-xl font-bold text-white">
                  JagCode<span className="gradient-text">DevOps</span>
                </span>
              </Link>
              
              <p className="text-slate-300 max-w-md">
                The future of cryptocurrency trading and NFT collection with stunning animations and seamless experiences.
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span>geddes@thewolfai.com.au</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>+610477367348</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>Australia</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-slate-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-slate-700/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              © {currentYear} JagCodeDevOps. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
