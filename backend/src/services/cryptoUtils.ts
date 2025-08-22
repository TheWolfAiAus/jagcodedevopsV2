// ES6 import style for specific crypto functions
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

// Full CryptoJS import for access to all methods
import * as CryptoJS from 'crypto-js';

export class CryptoUtils {
    
    /**
     * API call signing - typical use case for crypto exchanges
     */
    static signAPICall(message: string, nonce: string, path: string, privateKey: string): string {
        const hashDigest = sha256(nonce + message);
        const hmacDigest = Base64.stringify(hmacSHA512(path + hashDigest, privateKey));
        return hmacDigest;
    }

    /**
     * Simple HMAC SHA1 signing
     */
    static signHmacSHA1(message: string, key: string): string {
        return hmacSHA1(message, key).toString();
    }

    /**
     * SHA256 hash generation
     */
    static hash(message: string): string {
        return sha256(message).toString();
    }

    /**
     * AES encryption
     */
    static encrypt(message: string, secretKey: string): string {
        return AES.encrypt(message, secretKey).toString();
    }

    /**
     * AES decryption
     */
    static decrypt(encryptedMessage: string, secretKey: string): string {
        const bytes = AES.decrypt(encryptedMessage, secretKey);
        return bytes.toString(Utf8);
    }

    /**
     * Generate secure random string
     */
    static generateNonce(length: number = 16): string {
        return CryptoJS.lib.WordArray.random(length).toString();
    }

    /**
     * Base64 encoding
     */
    static base64Encode(message: string): string {
        return Base64.stringify(Utf8.parse(message));
    }

    /**
     * Base64 decoding
     */
    static base64Decode(encodedMessage: string): string {
        return Base64.parse(encodedMessage).toString(Utf8);
    }

    /**
     * HMAC SHA256 for JWT-like signing
     */
    static signHmacSHA256(payload: string, secret: string): string {
        return CryptoJS.HmacSHA256(payload, secret).toString();
    }

    /**
     * Generate API key hash for secure storage
     */
    static hashAPIKey(apiKey: string, salt?: string): string {
        const saltValue = salt || CryptoJS.lib.WordArray.random(128/8).toString();
        const hash = CryptoJS.PBKDF2(apiKey, saltValue, {
            keySize: 256/32,
            iterations: 10000
        });
        return `${saltValue}:${hash.toString()}`;
    }

    /**
     * Verify API key against stored hash
     */
    static verifyAPIKey(apiKey: string, storedHash: string): boolean {
        try {
            const [salt, hash] = storedHash.split(':');
            const computedHash = CryptoJS.PBKDF2(apiKey, salt, {
                keySize: 256/32,
                iterations: 10000
            });
            return computedHash.toString() === hash;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate timestamp-based signature for API requests
     */
    static generateTimestampSignature(
        method: string, 
        path: string, 
        body: string, 
        timestamp: number, 
        apiSecret: string
    ): string {
        const message = `${timestamp}${method}${path}${body}`;
        return Base64.stringify(hmacSHA512(message, apiSecret));
    }

    /**
     * Wallet address checksum validation (simplified)
     */
    static validateChecksumAddress(address: string): boolean {
        // Basic Ethereum address validation
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return false;
        }
        
        const hash = CryptoJS.SHA3(address.toLowerCase().replace('0x', ''), { outputLength: 256 });
        const hashString = hash.toString();
        
        for (let i = 0; i < 40; i++) {
            const char = address[i + 2];
            const shouldBeCapital = parseInt(hashString[i], 16) >= 8;
            
            if ((shouldBeCapital && char !== char.toUpperCase()) || 
                (!shouldBeCapital && char !== char.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    }
}

// Example usage demonstrations (for reference)
export class CryptoExamples {
    
    static demonstrateUsage() {
        console.log('=== Crypto-JS Usage Examples ===');
        
        // 1. API Signing Example
        const message = '{"symbol":"BTCUSD","side":"buy","amount":"0.1"}';
        const nonce = Date.now().toString();
        const path = '/api/v1/order';
        const privateKey = 'your-api-secret';
        
        const signature = CryptoUtils.signAPICall(message, nonce, path, privateKey);
        console.log('API Signature:', signature);
        
        // 2. Simple hashing
        const hash = CryptoUtils.hash('Hello World');
        console.log('SHA256 Hash:', hash);
        
        // 3. Encryption/Decryption
        const encrypted = CryptoUtils.encrypt('Secret message', 'password123');
        console.log('Encrypted:', encrypted);
        
        const decrypted = CryptoUtils.decrypt(encrypted, 'password123');
        console.log('Decrypted:', decrypted);
        
        // 4. Generate nonce for API calls
        const apiNonce = CryptoUtils.generateNonce();
        console.log('Generated Nonce:', apiNonce);
        
        // 5. Timestamp-based signature (common in crypto exchanges)
        const timestamp = Date.now();
        const timestampSig = CryptoUtils.generateTimestampSignature(
            'POST', 
            '/api/v1/order', 
            message, 
            timestamp, 
            privateKey
        );
        console.log('Timestamp Signature:', timestampSig);
    }
}

export default CryptoUtils;