export declare class SpeechService {
    private session;
    private currentUserId;
    private isConnected;
    private apiKey;
    private commands;
    constructor();
    private initializeCommands;
    setCurrentUser(userId: string): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private handleTranscript;
    private handlePartialTranscript;
    private processVoiceCommand;
    private findFuzzyMatches;
    sendAudioData(audioBuffer: Buffer): void;
    getAvailableCommands(): string[];
    isServiceConnected(): boolean;
    addCustomCommand(command: string, action: () => Promise<void>): void;
    removeCommand(command: string): boolean;
}
declare const _default: SpeechService;
export default _default;
//# sourceMappingURL=speechService.d.ts.map