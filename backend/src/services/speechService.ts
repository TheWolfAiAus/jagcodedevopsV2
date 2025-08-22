import { RealtimeSession } from '@speechmatics/real-time-client';
import databaseService from './databaseService';

interface TranscriptResult {
    transcript: string;
    confidence: number;
    is_final: boolean;
    timestamp: number;
}

interface SpeechCommand {
    command: string;
    action: () => Promise<void>;
    parameters?: any;
}

export class SpeechService {
    private session: RealtimeSession | null = null;
    private currentUserId: string | null = null;
    private isConnected = false;
    private apiKey: string;
    private commands: Map<string, SpeechCommand> = new Map();

    constructor() {
        this.apiKey = process.env.SPEECHMATICS_API_KEY || '';
        this.initializeCommands();
    }

    private initializeCommands(): void {
        // JAG-OPS voice commands
        this.commands.set('start mining', {
            command: 'start mining',
            action: async () => {
                console.log('🎤 Voice command: Starting mining operations...');
                if (this.currentUserId) {
                    await databaseService.logActivity(this.currentUserId, {
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
                    await databaseService.logActivity(this.currentUserId, {
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
                    await databaseService.logActivity(this.currentUserId, {
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
                    await databaseService.logActivity(this.currentUserId, {
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
                    const dashboard = await databaseService.getUserDashboard(this.currentUserId);
                    const portfolioValue = dashboard.summary.total_portfolio_value;
                    console.log(`💰 Portfolio value: $${portfolioValue}`);
                    
                    await databaseService.logActivity(this.currentUserId, {
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
                    await databaseService.logActivity(this.currentUserId, {
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
                    await databaseService.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: 'Profit strategy started via voice command'
                    });
                }
            }
        });
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async connect(): Promise<void> {
        if (!this.apiKey) {
            throw new Error('Speechmatics API key not provided');
        }

        try {
            this.session = new RealtimeSession({
                apiKey: this.apiKey
            });

            // Configure session settings
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

            // Set up event listeners
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
                await databaseService.logActivity(this.currentUserId, {
                    type: 'system_alert',
                    description: 'Voice recognition service activated'
                });
            }

        } catch (error) {
            console.error('Failed to connect to Speechmatics:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.session) {
            try {
                await this.session.stop();
                this.session = null;
                this.isConnected = false;
                console.log('🎤 Speech service disconnected');
                
                if (this.currentUserId) {
                    await databaseService.logActivity(this.currentUserId, {
                        type: 'system_alert',
                        description: 'Voice recognition service deactivated'
                    });
                }
            } catch (error) {
                console.error('Error disconnecting speech service:', error);
            }
        }
    }

    private handleTranscript(message: any): void {
        const transcript = message.metadata.transcript.toLowerCase().trim();
        const confidence = message.metadata.confidence || 0;

        console.log(`🎤 Final transcript: "${transcript}" (confidence: ${confidence})`);

        // Process voice commands
        this.processVoiceCommand(transcript, confidence);

        // Log transcript to database
        if (this.currentUserId) {
            databaseService.logActivity(this.currentUserId, {
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

    private handlePartialTranscript(message: any): void {
        const transcript = message.metadata.transcript.toLowerCase().trim();
        console.log(`🎤 Partial: "${transcript}"`);
    }

    private async processVoiceCommand(transcript: string, confidence: number): Promise<void> {
        // Only process commands with high confidence
        if (confidence < 0.7) {
            console.log(`🎤 Low confidence (${confidence}), ignoring command`);
            return;
        }

        // Check for exact command matches
        for (const [commandKey, command] of this.commands.entries()) {
            if (transcript.includes(commandKey)) {
                console.log(`🎤 Executing command: ${commandKey}`);
                
                try {
                    await command.action();
                    
                    if (this.currentUserId) {
                        await databaseService.logActivity(this.currentUserId, {
                            type: 'system_alert',
                            description: `Voice command executed: ${commandKey}`,
                            metadata: {
                                command: commandKey,
                                transcript,
                                confidence
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Failed to execute command ${commandKey}:`, error);
                }
                
                return; // Only execute the first matching command
            }
        }

        // Check for partial matches or similar commands
        const fuzzyMatches = this.findFuzzyMatches(transcript);
        if (fuzzyMatches.length > 0) {
            console.log(`🎤 Possible commands detected: ${fuzzyMatches.join(', ')}`);
            console.log('🎤 Please speak more clearly or use exact command phrases');
        }
    }

    private findFuzzyMatches(transcript: string): string[] {
        const matches: string[] = [];
        const words = transcript.split(' ');

        for (const [commandKey] of this.commands.entries()) {
            const commandWords = commandKey.split(' ');
            let matchCount = 0;

            for (const word of words) {
                if (commandWords.includes(word)) {
                    matchCount++;
                }
            }

            // If more than half the words match, consider it a fuzzy match
            if (matchCount >= commandWords.length * 0.5) {
                matches.push(commandKey);
            }
        }

        return matches;
    }

    sendAudioData(audioBuffer: Buffer): void {
        if (this.session && this.isConnected) {
            try {
                this.session.sendAudio(audioBuffer);
            } catch (error) {
                console.error('Failed to send audio data:', error);
            }
        } else {
            console.warn('Speech session not connected, cannot send audio');
        }
    }

    getAvailableCommands(): string[] {
        return Array.from(this.commands.keys());
    }

    isServiceConnected(): boolean {
        return this.isConnected;
    }

    addCustomCommand(command: string, action: () => Promise<void>): void {
        this.commands.set(command.toLowerCase(), {
            command: command.toLowerCase(),
            action
        });
        console.log(`🎤 Added custom voice command: "${command}"`);
    }

    removeCommand(command: string): boolean {
        return this.commands.delete(command.toLowerCase());
    }
}

export default new SpeechService();