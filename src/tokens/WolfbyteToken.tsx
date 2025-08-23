/**
 * Wolfbyte Token System
 * Creator: Brett JG - The Wolf AI Platform
 * Revolutionary token economy for advanced AI functions
 */

import React, {useEffect, useState} from 'react';
import {Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';

interface WolfbyteTransaction {
  id: string;
  type: 'mint' | 'burn' | 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: Date;
  functionUsed?: string;
}

interface WolfbyteBalance {
  total: number;
  pending: number;
  locked: number;
  earned: number;
}

const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: 'Wolf Pack',
    monthlyTokens: 500,
    price: 29.99,
    features: ['Basic AI Functions', 'Market Analysis', 'Email Intelligence'],
    color: '#10B981'
  },
  PRO: {
    name: 'Alpha Wolf',
    monthlyTokens: 2000,
    price: 99.99,
    features: ['All Basic Features', 'Blockchain Analysis', 'Privacy Scanning', 'Advanced Functions'],
    color: '#F59E0B'
  },
  ELITE: {
    name: 'Wolf Lord',
    monthlyTokens: 10000,
    price: 299.99,
    features: ['All Features', 'Unlimited Functions', 'Priority Processing', 'Custom Training'],
    color: '#EF4444'
  }
};

export const WolfbyteToken: React.FC = () => {
  const [balance, setBalance] = useState<WolfbyteBalance>({
    total: 1000,
    pending: 0,
    locked: 100,
    earned: 500
  });
  
  const [transactions, setTransactions] = useState<WolfbyteTransaction[]>([]);
  const [selectedTier, setSelectedTier] = useState<keyof typeof SUBSCRIPTION_TIERS | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Initialize with some sample transactions
    const sampleTransactions: WolfbyteTransaction[] = [
      {
        id: '1',
        type: 'mint',
        amount: 1000,
        description: 'Welcome bonus - Initial token allocation',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'spend',
        amount: -25,
        description: 'Crypto mixing analysis',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        functionUsed: 'analyze_crypto_mixing_trends'
      },
      {
        id: '3',
        type: 'earn',
        amount: 50,
        description: 'Daily activity bonus',
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      }
    ];
    
    setTransactions(sampleTransactions);
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const mintTokens = (amount: number, reason: string) => {
    const newTransaction: WolfbyteTransaction = {
      id: Date.now().toString(),
      type: 'mint',
      amount,
      description: reason,
      timestamp: new Date()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => ({
      ...prev,
      total: prev.total + amount,
      earned: prev.earned + amount
    }));
  };

  const burnTokens = (amount: number, reason: string, functionName?: string) => {
    if (balance.total < amount) {
      Alert.alert('Insufficient Wolfbytes', 'You need more Wolfbytes to perform this action.');
      return false;
    }
    
    const newTransaction: WolfbyteTransaction = {
      id: Date.now().toString(),
      type: 'burn',
      amount: -amount,
      description: reason,
      timestamp: new Date(),
      functionUsed: functionName
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => ({
      ...prev,
      total: prev.total - amount
    }));
    
    return true;
  };

  const subscribeTo = (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    const tierInfo = SUBSCRIPTION_TIERS[tier];
    
    Alert.alert(
      'Subscribe to ' + tierInfo.name,
      `Monthly subscription: $${tierInfo.price}\nMonthly Wolfbytes: ${tierInfo.monthlyTokens}\n\nThis will grant you access to advanced Wolf AI functions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: () => {
            // Simulate subscription
            mintTokens(tierInfo.monthlyTokens, `${tierInfo.name} subscription activated`);
            setSelectedTier(tier);
            Alert.alert('Success!', `Welcome to ${tierInfo.name}! You've received ${tierInfo.monthlyTokens} Wolfbytes.`);
          }
        }
      ]
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mint': return 'add-circle';
      case 'burn': return 'flame';
      case 'earn': return 'trophy';
      case 'spend': return 'flash';
      default: return 'help-circle';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'mint': return '#10B981';
      case 'burn': return '#EF4444';
      case 'earn': return '#F59E0B';
      case 'spend': return '#6366F1';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.tokenIcon, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name="coin" size={40} color="#FFD700" />
        </Animated.View>
        <Text style={styles.title}>Wolfbyte Tokens</Text>
        <Text style={styles.subtitle}>Power The Wolf AI</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Your Balance</Text>
          <TouchableOpacity onPress={() => mintTokens(100, 'Manual token bonus')}>
            <Ionicons name="add-circle-outline" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.balanceMain}>
          <Text style={styles.balanceAmount}>{balance.total.toLocaleString()}</Text>
          <Text style={styles.balanceCurrency}>WOLFBYTES</Text>
        </View>
        
        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceValue}>{(balance.total - balance.locked).toLocaleString()}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Locked</Text>
            <Text style={styles.balanceValue}>{balance.locked.toLocaleString()}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Earned</Text>
            <Text style={styles.balanceValue}>{balance.earned.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Subscription Tiers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Tiers</Text>
        <Text style={styles.sectionSubtitle}>Get monthly Wolfbytes and unlock premium features</Text>
        
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
          <TouchableOpacity 
            key={key}
            style={[
              styles.tierCard,
              { borderColor: tier.color },
              selectedTier === key && { backgroundColor: tier.color + '20' }
            ]}
            onPress={() => subscribeTo(key as keyof typeof SUBSCRIPTION_TIERS)}
          >
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: tier.color }]}>
                <Text style={styles.tierName}>{tier.name}</Text>
              </View>
              <Text style={styles.tierPrice}>${tier.price}/mo</Text>
            </View>
            
            <View style={styles.tierTokens}>
              <MaterialCommunityIcons name="coin" size={20} color="#FFD700" />
              <Text style={styles.tierTokensText}>{tier.monthlyTokens.toLocaleString()} Wolfbytes/month</Text>
            </View>
            
            <View style={styles.tierFeatures}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.tierFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={tier.color} />
                  <Text style={styles.tierFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={[
              styles.transactionIcon, 
              { backgroundColor: getTransactionColor(transaction.type) + '20' }
            ]}>
              <Ionicons 
                name={getTransactionIcon(transaction.type)} 
                size={20} 
                color={getTransactionColor(transaction.type)} 
              />
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              {transaction.functionUsed && (
                <Text style={styles.transactionFunction}>Function: {transaction.functionUsed}</Text>
              )}
              <Text style={styles.transactionTime}>
                {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.transactionAmountText,
                { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
              ]}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
              </Text>
              <Text style={styles.transactionCurrency}>WB</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Token Utility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Earn Wolfbytes</Text>
        
        <View style={styles.utilityCard}>
          <Ionicons name="trophy-outline" size={24} color="#F59E0B" />
          <View style={styles.utilityText}>
            <Text style={styles.utilityTitle}>Daily Activity</Text>
            <Text style={styles.utilityDescription}>Earn 50 Wolfbytes per day for using The Wolf AI</Text>
          </View>
        </View>
        
        <View style={styles.utilityCard}>
          <Ionicons name="people-outline" size={24} color="#10B981" />
          <View style={styles.utilityText}>
            <Text style={styles.utilityTitle}>Referral Bonus</Text>
            <Text style={styles.utilityDescription}>Get 500 Wolfbytes for each friend you refer</Text>
          </View>
        </View>
        
        <View style={styles.utilityCard}>
          <Ionicons name="star-outline" size={24} color="#6366F1" />
          <View style={styles.utilityText}>
            <Text style={styles.utilityTitle}>Perfect Analysis</Text>
            <Text style={styles.utilityDescription}>Earn bonus tokens for high-accuracy predictions</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
    backgroundColor: '#1A1A1A',
  },
  tokenIcon: {
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  balanceCard: {
    margin: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  balanceMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceAmount: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: 'bold',
  },
  balanceCurrency: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 5,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 5,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 20,
  },
  tierCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tierName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tierPrice: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tierTokens: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierTokensText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tierFeatures: {
    marginTop: 8,
  },
  tierFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierFeatureText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginLeft: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionFunction: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  transactionTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionCurrency: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  utilityText: {
    flex: 1,
    marginLeft: 12,
  },
  utilityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  utilityDescription: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
