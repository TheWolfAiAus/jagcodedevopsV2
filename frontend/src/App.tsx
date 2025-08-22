import {AnimatePresence} from 'framer-motion'
import {lazy, Suspense} from 'react'
import {Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Crypto = lazy(() => import('./pages/Crypto'))
const NFTs = lazy(() => import('./pages/NFTs'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <AnimatePresence mode="wait">
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/nfts" element={<NFTs />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </AnimatePresence>
  )
}

export default App
