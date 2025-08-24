import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { databaseService } from '@/lib/appwrite'
import { setCryptoData, setCryptoError } from '@/lib/slices/cryptoSlice'
import io from 'socket.io-client'

export const useRealTimeCrypto = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  // Fetch initial crypto data
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['crypto-data'],
    queryFn: async () => {
      const response = await databaseService.getCryptoData()
      return response.documents[0] || null
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })

  // Real-time WebSocket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000', {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('Connected to real-time crypto updates')
      socket.emit('subscribe', 'crypto-prices')
    })

    socket.on('crypto-update', (cryptoData) => {
      dispatch(setCryptoData(cryptoData))
      queryClient.setQueryData(['crypto-data'], cryptoData)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time updates')
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      dispatch(setCryptoError(error.message || 'Connection error'))
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch, queryClient])

  // Update Redux store when query data changes
  useEffect(() => {
    if (data) {
      dispatch(setCryptoData(data))
    }
    if (error) {
      dispatch(setCryptoError(error.message || 'Failed to fetch crypto data'))
    }
  }, [data, error, dispatch])

  return {
    data,
    error,
    isLoading,
    refetch
  }
}

export const useRealTimePortfolio = (userId: string) => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  // Fetch user transactions
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['user-transactions', userId],
    queryFn: () => databaseService.getUserTransactions(userId),
    enabled: !!userId,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  // Real-time transaction updates
  useEffect(() => {
    if (!userId) return

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')

    socket.on('connect', () => {
      socket.emit('subscribe', `user-${userId}`)
    })

    socket.on('transaction-update', (transaction) => {
      queryClient.setQueryData(['user-transactions', userId], (old: any) => {
        if (!old) return { documents: [transaction] }
        return {
          ...old,
          documents: [transaction, ...old.documents]
        }
      })
    })

    socket.on('portfolio-update', () => {
      refetch()
    })

    return () => {
      socket.disconnect()
    }
  }, [userId, queryClient, refetch])

  return {
    transactions: transactions?.documents || [],
    isLoading,
    refetch
  }
}

export const useRealTimeNotifications = (userId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')

    socket.on('connect', () => {
      socket.emit('subscribe', `notifications-${userId}`)
    })

    socket.on('notification', (notification) => {
      // Handle real-time notifications
      console.log('New notification:', notification)
      
      // You can show toast notifications here
      // toast.info(notification.message)
      
      // Update notifications cache
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    })

    return () => {
      socket.disconnect()
    }
  }, [userId, queryClient])
}