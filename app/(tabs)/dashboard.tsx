import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AppwriteService } from '@/services/appwriteService';
import { AppwriteUser, AppwritePortfolio, AppwriteTransaction, AppwriteActivity } from '@/lib/appwrite';

export default function Dashboard() {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [portfolio, setPortfolio] = useState<AppwritePortfolio | null>(null);
  const [transactions, setTransactions] = useState<AppwriteTransaction[]>([]);
  const [activities, setActivities] = useState<AppwriteActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setAuthError(null);

      // Check if Appwrite is ready
      if (!AppwriteService.isReady()) {
        setAuthError('Backend service not configured. Using demo mode.');
        setLoading(false);
        return;
      }

      // Try to get current user
      const currentUser = await AppwriteService.getCurrentUser();
      
      if (!currentUser) {
        setAuthError('Please sign in to view your dashboard');
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Load user data in parallel
      const [userPortfolio, userTransactions, userActivities] = await Promise.all([
        AppwriteService.getPortfolio(currentUser.$id),
        AppwriteService.getTransactions(currentUser.$id, 10),
        AppwriteService.getActivities(currentUser.$id, 5)
      ]);

      setPortfolio(userPortfolio);
      setTransactions(userTransactions);
      setActivities(userActivities);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setAuthError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleSignIn = () => {
    Alert.alert(
      'Sign In Required',
      'You need to sign in to access your dashboard. This feature will be available once authentication is configured.',
      [
        { text: 'OK', style: 'default' },
        { text: 'Retry', onPress: loadUserData }
      ]
    );
  };

  const renderDemoData = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Demo Mode - No Backend Connected</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Portfolio Overview</Text>
        <Text style={styles.valueText}>$12,345.67</Text>
        <Text style={styles.changeText}>+5.67% (24h)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        <View style={styles.transactionItem}>
          <Text style={styles.transactionText}>ETH Purchase</Text>
          <Text style={styles.transactionAmount}>+2.5 ETH</Text>
        </View>
        <View style={styles.transactionItem}>
          <Text style={styles.transactionText}>BTC Sale</Text>
          <Text style={styles.transactionAmount}>-0.1 BTC</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleSignIn}>
          <Text style={styles.actionButtonText}>Configure Authentication</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (authError) {
    if (authError.includes('not configured')) {
      return renderDemoData();
    }
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Required</Text>
        <Text style={styles.errorMessage}>{authError}</Text>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back, {user?.name}!</Text>
        <Text style={styles.subtitle}>Here's your portfolio overview</Text>
      </View>

      {portfolio ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio Value</Text>
          <Text style={styles.valueText}>${portfolio.totalValue.toLocaleString()}</Text>
          <Text style={styles.updateTime}>Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio</Text>
          <Text style={styles.emptyText}>No portfolio data available</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <View key={transaction.$id} style={styles.transactionItem}>
              <Text style={styles.transactionText}>
                {transaction.type.toUpperCase()} - {transaction.symbol}
              </Text>
              <Text style={styles.transactionAmount}>
                {transaction.type === 'send' ? '-' : '+'}{transaction.amount}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <View key={activity.$id} style={styles.activityItem}>
              <Text style={styles.activityText}>{activity.description}</Text>
              <Text style={styles.activityTime}>
                {new Date(activity.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activity</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 16,
    color: '#22c55e',
  },
  updateTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  transactionText: {
    fontSize: 14,
    color: '#374151',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
