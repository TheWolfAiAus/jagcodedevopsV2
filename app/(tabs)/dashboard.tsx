import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppwriteService } from '@/services/appwriteService';
import { getRealTimeService, RealtimeCallbacks } from '@/services/realTimeService';
import { AppwriteUser, AppwritePortfolio, AppwriteTransaction, AppwriteActivity } from '@/lib/appwrite';

export default function DashboardScreen() {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [portfolio, setPortfolio] = useState<AppwritePortfolio | null>(null);
  const [transactions, setTransactions] = useState<AppwriteTransaction[]>([]);
  const [activities, setActivities] = useState<AppwriteActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('Disconnected');

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const currentUser = await AppwriteService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Error', 'Please sign in to continue');
        return;
      }
      
      setUser(currentUser);

      // Load portfolio
      const userPortfolio = await AppwriteService.getPortfolio(currentUser.$id);
      setPortfolio(userPortfolio);

      // Load recent transactions
      const userTransactions = await AppwriteService.getTransactions(currentUser.$id, 10);
      setTransactions(userTransactions);

      // Load recent activities
      const userActivities = await AppwriteService.getActivities(currentUser.$id, 5);
      setActivities(userActivities);

    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const initializeRealtime = useCallback((userId: string) => {
    const realtimeCallbacks: RealtimeCallbacks = {
      onPortfolioUpdate: (updatedPortfolio) => {
        console.log('📊 Portfolio updated in real-time');
        setPortfolio(updatedPortfolio);
      },
      
      onTransactionUpdate: (updatedTransaction) => {
        console.log('💳 Transaction updated in real-time');
        setTransactions(prev => {
          const existingIndex = prev.findIndex(t => t.$id === updatedTransaction.$id);
          if (existingIndex !== -1) {
            // Update existing transaction
            const updated = [...prev];
            updated[existingIndex] = updatedTransaction;
            return updated;
          } else {
            // Add new transaction at the beginning
            return [updatedTransaction, ...prev].slice(0, 10);
          }
        });
      },
      
      onActivityUpdate: (newActivity) => {
        console.log('📝 New activity in real-time');
        setActivities(prev => [newActivity, ...prev].slice(0, 5));
      },
      
      onUserUpdate: (updatedUser) => {
        console.log('👤 User profile updated in real-time');
        setUser(updatedUser);
      },
      
      onConnect: () => {
        setRealtimeStatus('Connected');
        console.log('✅ Real-time connection established');
      },
      
      onDisconnect: () => {
        setRealtimeStatus('Disconnected');
        console.log('❌ Real-time connection lost');
      },
      
      onError: (error) => {
        setRealtimeStatus('Error');
        console.error('❌ Real-time error:', error);
      }
    };

    const realtimeService = getRealTimeService(realtimeCallbacks);
    realtimeService.initialize(userId);

    return realtimeService;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      
      return () => {
        // Cleanup is handled by the service singleton
      };
    }, [])
  );

  useEffect(() => {
    if (user) {
      const realtimeService = initializeRealtime(user.$id);
      
      return () => {
        // Service cleanup is handled by singleton pattern
      };
    }
  }, [user, initializeRealtime]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: AppwriteActivity['type']) => {
    switch (type) {
      case 'login': return '🔐';
      case 'transaction': return '💳';
      case 'portfolio_update': return '📊';
      case 'wallet_connect': return '🔗';
      case 'setting_change': return '⚙️';
      default: return '📝';
    }
  };

  const getTransactionStatusIcon = (status: AppwriteTransaction['status']) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading your dashboard...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.welcomeText}>
            Welcome back, {user?.name || 'User'}!
          </ThemedText>
          <ThemedView style={styles.statusIndicator}>
            <ThemedText style={[
              styles.statusText,
              realtimeStatus === 'Connected' ? styles.statusConnected : 
              realtimeStatus === 'Error' ? styles.statusError : styles.statusDisconnected
            ]}>
              🔴 {realtimeStatus}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Portfolio Overview */}
        <ThemedView style={styles.card}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>📊 Portfolio Overview</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Last updated: {portfolio?.lastUpdated ? formatDate(portfolio.lastUpdated) : 'Never'}
            </ThemedText>
          </ThemedView>
          
          {portfolio ? (
            <>
              <ThemedText style={styles.portfolioValue}>
                {formatCurrency(portfolio.totalValue)}
              </ThemedText>
              <ThemedText style={styles.portfolioAssets}>
                {portfolio.assets?.length || 0} Assets
              </ThemedText>
              
              {portfolio.assets && portfolio.assets.length > 0 && (
                <ThemedView style={styles.assetsList}>
                  {portfolio.assets.slice(0, 3).map((asset, index) => (
                    <ThemedView key={index} style={styles.assetItem}>
                      <ThemedText style={styles.assetSymbol}>{asset.symbol}</ThemedText>
                      <ThemedText style={styles.assetValue}>
                        {formatCurrency(asset.valueUsd)}
                      </ThemedText>
                    </ThemedView>
                  ))}
                  {portfolio.assets.length > 3 && (
                    <ThemedText style={styles.moreAssets}>
                      +{portfolio.assets.length - 3} more assets
                    </ThemedText>
                  )}
                </ThemedView>
              )}
            </>
          ) : (
            <ThemedText style={styles.noDataText}>
              No portfolio data available
            </ThemedText>
          )}
        </ThemedView>

        {/* Recent Transactions */}
        <ThemedView style={styles.card}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>💳 Recent Transactions</ThemedText>
          </ThemedView>
          
          {transactions.length > 0 ? (
            <ThemedView style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <ThemedView key={transaction.$id} style={styles.transactionItem}>
                  <ThemedView style={styles.transactionLeft}>
                    <ThemedText style={styles.transactionStatus}>
                      {getTransactionStatusIcon(transaction.status)}
                    </ThemedText>
                    <ThemedView>
                      <ThemedText style={styles.transactionType}>
                        {transaction.type.toUpperCase()}
                      </ThemedText>
                      <ThemedText style={styles.transactionNetwork}>
                        {transaction.network}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.transactionRight}>
                    <ThemedText style={styles.transactionAmount}>
                      {transaction.amount} {transaction.symbol}
                    </ThemedText>
                    <ThemedText style={styles.transactionTime}>
                      {formatDate(transaction.timestamp)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <ThemedText style={styles.noDataText}>
              No transactions found
            </ThemedText>
          )}
        </ThemedView>

        {/* Activity Feed */}
        <ThemedView style={styles.card}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>📝 Recent Activity</ThemedText>
          </ThemedView>
          
          {activities.length > 0 ? (
            <ThemedView style={styles.activitiesList}>
              {activities.map((activity) => (
                <ThemedView key={activity.$id} style={styles.activityItem}>
                  <ThemedText style={styles.activityIcon}>
                    {getActivityIcon(activity.type)}
                  </ThemedText>
                  <ThemedView style={styles.activityContent}>
                    <ThemedText style={styles.activityDescription}>
                      {activity.description}
                    </ThemedText>
                    <ThemedText style={styles.activityTime}>
                      {formatDate(activity.timestamp)} • {activity.platform}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <ThemedText style={styles.noDataText}>
              No recent activity
            </ThemedText>
          )}
        </ThemedView>

        {/* Wallet Connection Status */}
        <ThemedView style={styles.card}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>🔗 Wallet Status</ThemedText>
          </ThemedView>
          
          {user?.walletAddress ? (
            <ThemedView style={styles.walletConnected}>
              <ThemedText style={styles.walletStatus}>✅ Wallet Connected</ThemedText>
              <ThemedText style={styles.walletAddress}>
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.walletDisconnected}>
              <ThemedText style={styles.walletStatus}>❌ No Wallet Connected</ThemedText>
              <ThemedText style={styles.walletPrompt}>
                Connect your wallet to start trading
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusIndicator: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusConnected: {
    color: '#10B981',
  },
  statusError: {
    color: '#EF4444',
  },
  statusDisconnected: {
    color: '#F59E0B',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  portfolioAssets: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  assetsList: {
    gap: 8,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  assetSymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  assetValue: {
    fontSize: 14,
    color: '#10B981',
  },
  moreAssets: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionStatus: {
    fontSize: 16,
    marginRight: 12,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionNetwork: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  walletConnected: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  walletDisconnected: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  walletStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  walletPrompt: {
    fontSize: 12,
    opacity: 0.8,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    padding: 20,
  },
});
