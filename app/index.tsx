import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { AppwriteService } from '@/services/appwriteService';

export default function Index() {
  const [connectionTest, setConnectionTest] = useState<string>('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Testing Appwrite connection...');
        
        if (AppwriteService.isReady()) {
          console.log('✅ AppwriteService is ready');
          
          // Try to get current user (will be null if not signed in, but shouldn't throw)
          const user = await AppwriteService.getCurrentUser();
          console.log('👤 Current user result:', user);
          
          setConnectionTest('✅ Appwrite Connected & Ready!');
        } else {
          console.log('⚠️ AppwriteService not ready');
          setConnectionTest('⚠️ Using Demo Mode');
        }
      } catch (error) {
        console.error('❌ Connection test failed:', error);
        setConnectionTest(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>JagCodeDevOps</Text>
        <Text style={styles.subtitle}>Crypto & Blockchain Development Platform</Text>
      </View>

      {/* Connection Status - Only show if there's an issue */}
      {connectionTest !== '✅ Appwrite Connected & Ready!' && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Backend Status</Text>
          <Text style={styles.statusText}>{connectionTest}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Welcome to JagCodeDevOps</Text>
        <Text style={styles.description}>
          A comprehensive platform for cryptocurrency tracking, DeFi analysis, 
          NFT management, and blockchain development tools.
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Features</Text>
        
        <Link href="/(tabs)/dashboard" asChild>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>📊 Dashboard</Text>
            <Text style={styles.featureDescription}>
              Real-time portfolio tracking and analytics
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/explore" asChild>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>🔍 Crypto Tracker</Text>
            <Text style={styles.featureDescription}>
              Track cryptocurrency prices and market data
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureTitle}>🎨 NFT Hunter</Text>
          <Text style={styles.featureDescription}>
            Discover and manage NFT collections
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureTitle}>⚡ DeFi Analyzer</Text>
          <Text style={styles.featureDescription}>
            Analyze DeFi protocols and opportunities
          </Text>
        </TouchableOpacity>

        <Link href="/(tabs)/wolf" asChild>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>🐺 Wolf AI</Text>
            <Text style={styles.featureDescription}>
              AI-powered trading and analysis assistant
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with React Native & Expo Router
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#16213e',
    textAlign: 'center',
    opacity: 0.8,
  },
  statusCard: {
    backgroundColor: '#fff3cd',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#856404',
  },
  section: {
    padding: 24,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featuresContainer: {
    padding: 16,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginTop: 32,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.7,
  },
});
