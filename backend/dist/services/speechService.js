"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechService = void 0;
const databaseService_1 = __importDefault(require("./databaseService"));
class SpeechService {
    constructor() {
        this.session = null;
        this.currentUserId = null;
        this.isConnected = false;
        this.commands = new Map();
        this.apiKey = process.env.SPEECHMATICS_API_KEY || '';
        this.initializeCommands();
    }
    initializeCommands() {
        this.commands.set('start mining', {
            command: 'start mining',
            action: async () => {
                console.log('🎤 Voice command: Starting mining operations...');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'mining_start',
                        description: 'Mining started via voice command'
                    });
                }
            }
        });
        this.commands.set('stop mining', {
            command: 'stop mining',
            action: async () => {
                console.log('🎤 Voice command: Stopping mining operations...');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'mining_stop',
                        description: 'Mining stopped via voice command'
                    });
                }
            }
        });
        this.commands.set('find nft opportunities', {
            command: 'find nft opportunities',
            action: async () => {
                console.log('🎤 Voice command: Searching for NFT opportunities...');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'nft_found',
                        description: 'NFT search initiated via voice command'
                    });
                }
            }
        });
        this.commands.set('show dashboard', {
            command: 'show dashboard',
            action: async () => {
                console.log('🎤 Voice command: Opening dashboard...');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: 'Dashboard accessed via voice command'
                    });
                }
            }
        });
        this.commands.set('get portfolio value', {
            command: 'get portfolio value',
            action: async () => {
                console.log('🎤 Voice command: Retrieving portfolio value...');
                if (this.currentUserId) {
                    const dashboard = await databaseService_1.default.getUserDashboard(this.currentUserId);
                    const portfolioValue = dashboard.summary.total_portfolio_value;
                    console.log(`💰 Portfolio value: $${portfolioValue}`);
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: `Portfolio value checked via voice: $${portfolioValue}`
                    });
                }
            }
        });
        this.commands.set('emergency stop', {
            command: 'emergency stop',
            action: async () => {
                console.log('🎤 Voice command: EMERGENCY STOP activated!');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: 'EMERGENCY STOP activated via voice command'
                    });
                }
            }
        });
        this.commands.set('start profit strategy', {
            command: 'start profit strategy',
            action: async () => {
                console.log('🎤 Voice command: Starting profit strategy...');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: 'Profit strategy started via voice command'
                    });
                }
            }
        });
    }
    setCurrentUser(userId) {
        this.currentUserId = userId;
    }
    async connect() {
        if (!this.apiKey) {
            throw new Error('Speechmatics API key not provided');
        }
        try {
            this.session = new RealtimeSession({
                apiKey: this.apiKey
            });
            await this.session.start({
                transcription_config: {
                    language: 'en',
                    enable_partials: true,
                    max_delay: 3,
                    max_delay_mode: 'fixed'
                },
                audio_format: {
                    type: 'raw',
                    encoding: 'pcm_f32le',
                    sample_rate: 16000
                }
            });
            this.session.addListener('RecognitionStarted', () => {
                console.log('🎤 Speech recognition started');
                this.isConnected = true;
            });
            this.session.addListener('AddTranscript', (message) => {
                this.handleTranscript(message);
            });
            this.session.addListener('AddPartialTranscript', (message) => {
                this.handlePartialTranscript(message);
            });
            this.session.addListener('EndOfTranscript', () => {
                console.log('🎤 End of transcript');
            });
            this.session.addListener('Error', (error) => {
                console.error('🎤 Speech recognition error:', error);
                this.isConnected = false;
            });
            this.session.addListener('Warning', (warning) => {
                console.warn('🎤 Speech recognition warning:', warning);
            });
            console.log('🎤 Speech service connected to Speechmatics');
            if (this.currentUserId) {
                await databaseService_1.default.logActivity(this.currentUserId, {
                    type: 'system_alert',
                    description: 'Voice recognition service activated'
                });
            }
        }
        catch (error) {
            console.error('Failed to connect to Speechmatics:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.session) {
            try {
                await this.session.stop();
                this.session = null;
                this.isConnected = false;
                console.log('🎤 Speech service disconnected');
                if (this.currentUserId) {
                    await databaseService_1.default.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: 'Voice recognition service deactivated'
                    });
                }
            }
            catch (error) {
                console.error('Error disconnecting speech service:', error);
            }
        }
    }
    handleTranscript(message) {
        const transcript = message.metadata.transcript.toLowerCase().trim();
        const confidence = message.metadata.confidence || 0;
        console.log(`🎤 Final transcript: "${transcript}" (confidence: ${confidence})`);
        this.processVoiceCommand(transcript, confidence);
        if (this.currentUserId) {
            databaseService_1.default.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Voice transcript: "${transcript}"`,
                metadata: {
                    transcript,
                    confidence,
                    is_final: true,
                    timestamp: Date.now()
                }
            }).catch(error => console.error('Failed to log transcript:', error));
        }
    }
    handlePartialTranscript(message) {
        const transcript = message.metadata.transcript.toLowerCase().trim();
        console.log(`🎤 Partial: "${transcript}"`);
    }
    async processVoiceCommand(transcript, confidence) {
        if (confidence < 0.7) {
            console.log(`🎤 Low confidence (${confidence}), ignoring command`);
            return;
        }
        for (const [commandKey, command] of this.commands.entries()) {
            if (transcript.includes(commandKey)) {
                console.log(`🎤 Executing command: ${commandKey}`);
                try {
                    await command.action();
                    if (this.currentUserId) {
                        await databaseService_1.default.logActivity(this.currentUserId, {
                            type: 'system_alert',
                            description: `Voice command executed: ${commandKey}`,
                            metadata: {
                                command: commandKey,
                                transcript,
                                confidence
                            }
                        });
                    }
                }
                catch (error) {
                    console.error(`Failed to execute command ${commandKey}:`, error);
                }
                return;
            }
        }
        const fuzzyMatches = this.findFuzzyMatches(transcript);
        if (fuzzyMatches.length > 0) {
            console.log(`🎤 Possible commands detected: ${fuzzyMatches.join(', ')}`);
            console.log('🎤 Please speak more clearly or use exact command phrases');
        }
    }
    findFuzzyMatches(transcript) {
        const matches = [];
        const words = transcript.split(' ');
        for (const [commandKey] of this.commands.entries()) {
            const commandWords = commandKey.split(' ');
            let matchCount = 0;
            for (const word of words) {
                if (commandWords.includes(word)) {
                    matchCount++;
                }
            }
            if (matchCount >= commandWords.length * 0.5) {
                matches.push(commandKey);
            }
        }
        return matches;
    }
    sendAudioData(audioBuffer) {
        if (this.session && this.isConnected) {
            try {
                this.session.sendAudio(audioBuffer);
            }
            catch (error) {
                console.error('Failed to send audio data:', error);
            }
        }
        else {
            console.warn('Speech session not connected, cannot send audio');
        }
    }
    getAvailableCommands() {
        return Array.from(this.commands.keys());
    }
    isServiceConnected() {
        return this.isConnected;
    }
    addCustomCommand(command, action) {
        this.commands.set(command.toLowerCase(), {
            command: command.toLowerCase(),
            action
        });
        console.log(`🎤 Added custom voice command: "${command}"`);
    }
    removeCommand(command) {
        return this.commands.delete(command.toLowerCase());
    }
}
exports.SpeechService = SpeechService;
exports.default = new SpeechService();
//# sourceMappingURL=speechService.js.map