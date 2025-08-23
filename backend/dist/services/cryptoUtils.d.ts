export declare class CryptoUtils {
    static signAPICall(message: string, nonce: string, path: string, privateKey: string): string;
    static signHmacSHA1(message: string, key: string): string;
    static hash(message: string): string;
    static encrypt(message: string, secretKey: string): string;
    static decrypt(encryptedMessage: string, secretKey: string): string;
    static generateNonce(length?: number): string;
    static base64Encode(message: string): string;
    static base64Decode(encodedMessage: string): string;
    static signHmacSHA256(payload: string, secret: string): string;
    static hashAPIKey(apiKey: string, salt?: string): string;
    static verifyAPIKey(apiKey: string, storedHash: string): boolean;
    static generateTimestampSignature(method: string, path: string, body: string, timestamp: number, apiSecret: string): string;
    static validateChecksumAddress(address: string): boolean;
}
export declare class CryptoExamples {
    static demonstrateUsage(): void;
}
export default CryptoUtils;
//# sourceMappingURL=cryptoUtils.d.ts.map