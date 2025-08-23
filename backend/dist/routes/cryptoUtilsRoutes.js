"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cryptoUtils_1 = __importDefault(require("../services/cryptoUtils"));
const router = (0, express_1.Router)();
router.post('/hash', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const hash = cryptoUtils_1.default.hash(message);
        res.json({
            message,
            hash,
            algorithm: 'SHA256'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/encrypt', (req, res) => {
    try {
        const { message, key } = req.body;
        if (!message || !key) {
            return res.status(400).json({ error: 'Message and key are required' });
        }
        const encrypted = cryptoUtils_1.default.encrypt(message, key);
        res.json({
            original: message,
            encrypted,
            algorithm: 'AES'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/decrypt', (req, res) => {
    try {
        const { encrypted, key } = req.body;
        if (!encrypted || !key) {
            return res.status(400).json({ error: 'Encrypted message and key are required' });
        }
        const decrypted = cryptoUtils_1.default.decrypt(encrypted, key);
        res.json({
            encrypted,
            decrypted,
            algorithm: 'AES'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/sign-api', (req, res) => {
    try {
        const { message, nonce, path, privateKey } = req.body;
        if (!message || !nonce || !path || !privateKey) {
            return res.status(400).json({
                error: 'message, nonce, path, and privateKey are required'
            });
        }
        const signature = cryptoUtils_1.default.signAPICall(message, nonce, path, privateKey);
        res.json({
            message,
            nonce,
            path,
            signature,
            method: 'HMAC-SHA512 + Base64'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/nonce', (req, res) => {
    try {
        const length = parseInt(req.query.length) || 16;
        const nonce = cryptoUtils_1.default.generateNonce(length);
        res.json({
            nonce,
            length,
            timestamp: Date.now()
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/hmac-sha1', (req, res) => {
    try {
        const { message, key } = req.body;
        if (!message || !key) {
            return res.status(400).json({ error: 'Message and key are required' });
        }
        const signature = cryptoUtils_1.default.signHmacSHA1(message, key);
        res.json({
            message,
            signature,
            algorithm: 'HMAC-SHA1'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/timestamp-signature', (req, res) => {
    try {
        const { method, path, body, apiSecret } = req.body;
        if (!method || !path || !apiSecret) {
            return res.status(400).json({
                error: 'method, path, and apiSecret are required'
            });
        }
        const timestamp = Date.now();
        const signature = cryptoUtils_1.default.generateTimestampSignature(method, path, body || '', timestamp, apiSecret);
        res.json({
            method,
            path,
            body: body || '',
            timestamp,
            signature,
            algorithm: 'HMAC-SHA512 + Base64'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/base64/encode', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const encoded = cryptoUtils_1.default.base64Encode(message);
        res.json({
            original: message,
            encoded
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/base64/decode', (req, res) => {
    try {
        const { encoded } = req.body;
        if (!encoded) {
            return res.status(400).json({ error: 'Encoded message is required' });
        }
        const decoded = cryptoUtils_1.default.base64Decode(encoded);
        res.json({
            encoded,
            decoded
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/validate-address', (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        const isValid = cryptoUtils_1.default.validateChecksumAddress(address);
        res.json({
            address,
            isValid,
            checksumValidation: true
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/hash-api-key', (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }
        const hashedKey = cryptoUtils_1.default.hashAPIKey(apiKey);
        res.json({
            originalKey: apiKey,
            hashedKey,
            algorithm: 'PBKDF2'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/verify-api-key', (req, res) => {
    try {
        const { apiKey, hashedKey } = req.body;
        if (!apiKey || !hashedKey) {
            return res.status(400).json({ error: 'API key and hashed key are required' });
        }
        const isValid = cryptoUtils_1.default.verifyAPIKey(apiKey, hashedKey);
        res.json({
            apiKey,
            hashedKey,
            isValid
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=cryptoUtilsRoutes.js.map