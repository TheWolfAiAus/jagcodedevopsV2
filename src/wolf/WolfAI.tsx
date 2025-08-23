/**
 * The Wolf AI - Advanced AI Assistant with Grey Zone Functions
 * Creator: Brett JG - TheWolfAI System
 * Email: brettjg0724@outlook.com
 * ID: dfc5c14f-c8cb-4c36-bbab-ce5b96c72a49
 */

import React, {useEffect, useRef, useState} from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';

interface WolfMessage {
  id: string;
  type: 'user' | 'wolf';
  content: string;
  timestamp: Date;
  function?: string;
  data?: any;
}

interface WolfFunction {
  name: string;
  description: string;
  enabled: boolean;
  category: 'analysis' | 'intelligence' | 'blockchain' | 'privacy' | 'advanced';
  riskLevel: 'low' | 'medium' | 'high';
  parameters?: any;
}

const WOLF_FUNCTIONS: WolfFunction[] = [
  {
    name: 'market_signal_noise_discriminator',
    description: 'Analyze market signals from social media and forums',
    enabled: true,
    category: 'intelligence',
    riskLevel: 'low'
  },
  {
    name: 'analyze_crypto_mixing_trends',
    description: 'Identify crypto mixing patterns and taint flows',
    enabled: true,
    category: 'blockchain',
    riskLevel: 'medium'
  },
  {
    name: 'scrape_competitor_email_campaigns',
    description: 'Analyze competitor marketing strategies',
    enabled: true,
    category: 'intelligence',
    riskLevel: 'low'
  },
  {
    name: 'identify_privacy_vulnerabilities',
    description: 'Scan for privacy leaks and vulnerabilities',
    enabled: true,
    category: 'privacy',
    riskLevel: 'high'
  },
  {
    name: 'discover_tor_hidden_services',
    description: 'Map Tor hidden services for research',
    enabled: false,
    category: 'advanced',
    riskLevel: 'high'
  },
  {
    name: 'generate_deepfake_audio_sample',
    description: 'Create voice synthesis samples',
    enabled: false,
    category: 'advanced',
    riskLevel: 'high'
  },
  {
    name: 'automate_tax_arbitrage_structures',
    description: 'Design tax-efficient entity structures',
    enabled: false,
    category: 'advanced',
    riskLevel: 'high'
  },
  {
    name: 'exploit_surface_analysis',
    description: 'Analyze software for vulnerabilities',
    enabled: true,
    category: 'analysis',
    riskLevel: 'medium'
  }
];

export const WolfAI: React.FC = () => {
  const [messages, setMessages] = useState<WolfMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wolfbytes, setWolfbytes] = useState(1000);
  const [enabledFunctions, setEnabledFunctions] = useState<Set<string>>(new Set());
  const [showFunctions, setShowFunctions] = useState(false);
  const [wolfPersonality, setWolfPersonality] = useState<'professional' | 'casual' | 'advanced'>('advanced');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize The Wolf with personality
    addWolfMessage(getWolfGreeting());
    
    // Load enabled functions
    const defaultEnabled = WOLF_FUNCTIONS
      .filter(f => f.enabled)
      .map(f => f.name);
    setEnabledFunctions(new Set(defaultEnabled));
    
    // Start pulse animation for Wolf avatar
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getWolfGreeting = (): string => {
    const greetings = [
      "🐺 The Wolf is online. Advanced systems initialized. How can I assist you today?",
      "🔥 Brett, The Wolf AI is ready. All grey zone functions loaded and operational.",
      "⚡ Wolf systems active. Market intelligence, blockchain analysis, and advanced functions ready.",
      "🎯 The Wolf sees all, knows all. What intelligence do you require today?",
      "💎 Wolf AI at your service. Wolfbyte balance: 1000 tokens. Ready for advanced operations."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const addWolfMessage = (content: string, functionName?: string, data?: any) => {
    const message: WolfMessage = {
      id: Date.now().toString(),
      type: 'wolf',
      content,
      timestamp: new Date(),
      function: functionName,
      data
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: WolfMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const processUserInput = async (input: string) => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    setInputText('');
    setIsTyping(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const response = generateWolfResponse(input);
      addWolfMessage(response.message, response.function, response.data);
      setIsTyping(false);
      
      // Deduct Wolfbytes for advanced functions
      if (response.cost > 0) {
        setWolfbytes(prev => Math.max(0, prev - response.cost));
      }
    }, 1500 + Math.random() * 1000);
  };

  const generateWolfResponse = (input: string): { message: string; function?: string; data?: any; cost: number } => {
    const inputLower = input.toLowerCase();
    
    // Check for function triggers
    if (inputLower.includes('market') && inputLower.includes('signal')) {
      return {
        message: "🔍 Analyzing market signals across Reddit, Twitter, and Telegram...\n\nDetected 12 actionable alpha signals:\n• BTC: Strong bullish sentiment (0.87 score)\n• ETH: Mixed signals, whale accumulation detected\n• SOL: Rising social volume, potential breakout\n\n💰 Cost: 10 Wolfbytes",
        function: 'market_signal_noise_discriminator',
        data: { signals: 12, confidence: 0.87 },
        cost: 10
      };
    }
    
    if (inputLower.includes('crypto') && inputLower.includes('mixing')) {
      return {
        message: "🕵️ Blockchain analysis initiated...\n\nWallet Analysis Complete:\n• 3 mixing services detected\n• Taint score: 0.23 (low risk)\n• Transaction complexity: Medium\n• Privacy level: High\n\n⚠️ Cost: 25 Wolfbytes",
        function: 'analyze_crypto_mixing_trends',
        data: { mixers: 3, taint: 0.23 },
        cost: 25
      };
    }
    
    if (inputLower.includes('competitor') || inputLower.includes('email')) {
      return {
        message: "📧 Competitor intelligence gathering...\n\nEmail Campaign Analysis:\n• 47 campaigns analyzed across 8 domains\n• 23 signup forms discovered\n• 15 drip sequences mapped\n• Best performing subject line: '🚀 This changes everything'\n\n📊 Cost: 15 Wolfbytes",
        function: 'scrape_competitor_email_campaigns',
        data: { campaigns: 47, domains: 8 },
        cost: 15
      };
    }
    
    if (inputLower.includes('vulnerability') || inputLower.includes('privacy')) {
      return {
        message: "🛡️ Privacy vulnerability scan initiated...\n\nScan Results:\n• 12 domains analyzed\n• 8 privacy vulnerabilities found\n• 3 high-severity issues detected\n• 5 exposed endpoints discovered\n\n🔒 Immediate action recommended for high-risk items.\n\n⚡ Cost: 20 Wolfbytes",
        function: 'identify_privacy_vulnerabilities',
        data: { vulns: 8, highRisk: 3 },
        cost: 20
      };
    }
    
    // General Wolf responses
    const responses = [
      "🐺 The Wolf processes all information through advanced neural networks. What specific intelligence do you seek?",
      "⚡ I see patterns others miss, Brett. Market movements, blockchain flows, competitor strategies - all visible to The Wolf.",
      "🔮 My algorithms detect signals in the noise. Ask me about market analysis, crypto intelligence, or competitor research.",
      "💎 The Wolf's knowledge spans the digital realm. From blockchain to market psychology, I analyze all.",
      "🎯 Your request has been processed through my advanced reasoning systems. Please be more specific for optimal results."
    ];
    
    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      cost: 0
    };
  };

  const toggleFunction = (functionName: string) => {
    const newEnabled = new Set(enabledFunctions);
    if (newEnabled.has(functionName)) {
      newEnabled.delete(functionName);
    } else {
      newEnabled.add(functionName);
    }
    setEnabledFunctions(newEnabled);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analysis': return 'analytics-outline';
      case 'intelligence': return 'eye-outline';
      case 'blockchain': return 'logo-bitcoin';
      case 'privacy': return 'shield-checkmark-outline';
      case 'advanced': return 'nuclear-outline';
      default: return 'code-outline';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.wolfAvatar, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name="wolf" size={32} color="#FF6B35" />
        </Animated.View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>The Wolf AI</Text>
          <Text style={styles.headerSubtitle}>Advanced Intelligence System</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.wolfbyteContainer}>
            <MaterialCommunityIcons name="coin" size={16} color="#FFD700" />
            <Text style={styles.wolfbyteText}>{wolfbytes}</Text>
          </View>
          <TouchableOpacity 
            style={styles.functionsButton}
            onPress={() => setShowFunctions(!showFunctions)}
          >
            <Ionicons name="settings-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Functions Panel */}
      {showFunctions && (
        <View style={styles.functionsPanel}>
          <Text style={styles.functionsPanelTitle}>Wolf Functions</Text>
          <ScrollView style={styles.functionsList}>
            {WOLF_FUNCTIONS.map((func) => (
              <View key={func.name} style={styles.functionItem}>
                <View style={styles.functionHeader}>
                  <Ionicons 
                    name={getCategoryIcon(func.category) as any} 
                    size={18} 
                    color={getRiskColor(func.riskLevel)} 
                  />
                  <Text style={styles.functionName}>{func.name}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(func.riskLevel) }]}>
                    <Text style={styles.riskText}>{func.riskLevel}</Text>
                  </View>
                  <Switch
                    value={enabledFunctions.has(func.name)}
                    onValueChange={() => toggleFunction(func.name)}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor={enabledFunctions.has(func.name) ? '#FFF' : '#9CA3AF'}
                  />
                </View>
                <Text style={styles.functionDescription}>{func.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.type === 'user' ? styles.userMessage : styles.wolfMessage
          ]}>
            {message.type === 'wolf' && (
              <View style={styles.messageAvatar}>
                <MaterialCommunityIcons name="wolf" size={20} color="#FF6B35" />
              </View>
            )}
            <View style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userBubble : styles.wolfBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.type === 'user' ? styles.userText : styles.wolfText
              ]}>
                {message.content}
              </Text>
              {message.function && (
                <View style={styles.functionTag}>
                  <Ionicons name="flash" size={12} color="#FF6B35" />
                  <Text style={styles.functionTagText}>{message.function}</Text>
                </View>
              )}
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
            {message.type === 'user' && (
              <View style={styles.messageAvatar}>
                <Ionicons name="person" size={20} color="#10B981" />
              </View>
            )}
          </View>
        ))}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.wolfMessage]}>
            <View style={styles.messageAvatar}>
              <MaterialCommunityIcons name="wolf" size={20} color="#FF6B35" />
            </View>
            <View style={[styles.messageBubble, styles.wolfBubble, styles.typingBubble]}>
              <Text style={styles.typingText}>The Wolf is analyzing...</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask The Wolf anything..."
          placeholderTextColor="#6B7280"
          multiline
          onSubmitEditing={() => processUserInput(inputText)}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={() => processUserInput(inputText)}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() ? "#FF6B35" : "#6B7280"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  wolfAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wolfbyteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  wolfbyteText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  functionsButton: {
    padding: 8,
  },
  functionsPanel: {
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    maxHeight: 300,
  },
  functionsPanelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
  },
  functionsList: {
    paddingHorizontal: 15,
  },
  functionItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  functionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  functionName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  functionDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 26,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  wolfMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  wolfBubble: {
    backgroundColor: '#374151',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  wolfText: {
    color: '#FFFFFF',
  },
  messageTime: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  functionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  functionTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  typingBubble: {
    paddingVertical: 8,
  },
  typingText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    marginTop: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    marginRight: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
