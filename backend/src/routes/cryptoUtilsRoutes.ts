import { Router, Request, Response } from 'express';
import CryptoUtils from '../services/cryptoUtils';

const router = Router();

// Hash generation endpoint
router.post('/hash', (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const hash = CryptoUtils.hash(message);
        
        res.json({
            message,
            hash,
            algorithm: 'SHA256'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Encryption endpoint
router.post('/encrypt', (req: Request, res: Response) => {
    try {
        const { message, key } = req.body;
        
        if (!message || !key) {
            return res.status(400).json({ error: 'Message and key are required' });
        }
        
        const encrypted = CryptoUtils.encrypt(message, key);
        
        res.json({
            original: message,
            encrypted,
            algorithm: 'AES'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Decryption endpoint
router.post('/decrypt', (req: Request, res: Response) => {
    try {
        const { encrypted, key } = req.body;
        
        if (!encrypted || !key) {
            return res.status(400).json({ error: 'Encrypted message and key are required' });
        }
        
        const decrypted = CryptoUtils.decrypt(encrypted, key);
        
        res.json({
            encrypted,
            decrypted,
            algorithm: 'AES'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// API signature generation (for exchange API calls)
router.post('/sign-api', (req: Request, res: Response) => {
    try {
        const { message, nonce, path, privateKey } = req.body;
        
        if (!message || !nonce || !path || !privateKey) {
            return res.status(400).json({ 
                error: 'message, nonce, path, and privateKey are required' 
            });
        }
        
        const signature = CryptoUtils.signAPICall(message, nonce, path, privateKey);
        
        res.json({
            message,
            nonce,
            path,
            signature,
            method: 'HMAC-SHA512 + Base64'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Generate secure nonce
router.get('/nonce', (req: Request, res: Response) => {
    try {
        const length = parseInt(req.query.length as string) || 16;
        const nonce = CryptoUtils.generateNonce(length);
        
        res.json({
            nonce,
            length,
            timestamp: Date.now()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// HMAC SHA1 signing (simple)
router.post('/hmac-sha1', (req: Request, res: Response) => {
    try {
        const { message, key } = req.body;
        
        if (!message || !key) {
            return res.status(400).json({ error: 'Message and key are required' });
        }
        
        const signature = CryptoUtils.signHmacSHA1(message, key);
        
        res.json({
            message,
            signature,
            algorithm: 'HMAC-SHA1'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Timestamp-based signature (crypto exchange style)
router.post('/timestamp-signature', (req: Request, res: Response) => {
    try {
        const { method, path, body, apiSecret } = req.body;
        
        if (!method || !path || !apiSecret) {
            return res.status(400).json({ 
                error: 'method, path, and apiSecret are required' 
            });
        }
        
        const timestamp = Date.now();
        const signature = CryptoUtils.generateTimestampSignature(
            method, 
            path, 
            body || '', 
            timestamp, 
            apiSecret
        );
        
        res.json({
            method,
            path,
            body: body || '',
            timestamp,
            signature,
            algorithm: 'HMAC-SHA512 + Base64'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Base64 encoding/decoding
router.post('/base64/encode', (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const encoded = CryptoUtils.base64Encode(message);
        
        res.json({
            original: message,
            encoded
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/base64/decode', (req: Request, res: Response) => {
    try {
        const { encoded } = req.body;
        
        if (!encoded) {
            return res.status(400).json({ error: 'Encoded message is required' });
        }
        
        const decoded = CryptoUtils.base64Decode(encoded);
        
        res.json({
            encoded,
            decoded
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Validate Ethereum address checksum
router.post('/validate-address', (req: Request, res: Response) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        const isValid = CryptoUtils.validateChecksumAddress(address);
        
        res.json({
            address,
            isValid,
            checksumValidation: true
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// API key hashing and verification
router.post('/hash-api-key', (req: Request, res: Response) => {
    try {
        const { apiKey } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }
        
        const hashedKey = CryptoUtils.hashAPIKey(apiKey);
        
        res.json({
            originalKey: apiKey,
            hashedKey,
            algorithm: 'PBKDF2'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify-api-key', (req: Request, res: Response) => {
    try {
        const { apiKey, hashedKey } = req.body;
        
        if (!apiKey || !hashedKey) {
            return res.status(400).json({ error: 'API key and hashed key are required' });
        }
        
        const isValid = CryptoUtils.verifyAPIKey(apiKey, hashedKey);
        
        res.json({
            apiKey,
            hashedKey,
            isValid
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;