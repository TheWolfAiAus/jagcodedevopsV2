"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoExamples = exports.CryptoUtils = void 0;
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const hmac_sha512_1 = __importDefault(require("crypto-js/hmac-sha512"));
const hmac_sha1_1 = __importDefault(require("crypto-js/hmac-sha1"));
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const aes_1 = __importDefault(require("crypto-js/aes"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const CryptoJS = __importStar(require("crypto-js"));
class CryptoUtils {
    static signAPICall(message, nonce, path, privateKey) {
        const hashDigest = (0, sha256_1.default)(nonce + message);
        const hmacDigest = enc_base64_1.default.stringify((0, hmac_sha512_1.default)(path + hashDigest, privateKey));
        return hmacDigest;
    }
    static signHmacSHA1(message, key) {
        return (0, hmac_sha1_1.default)(message, key).toString();
    }
    static hash(message) {
        return (0, sha256_1.default)(message).toString();
    }
    static encrypt(message, secretKey) {
        return aes_1.default.encrypt(message, secretKey).toString();
    }
    static decrypt(encryptedMessage, secretKey) {
        const bytes = aes_1.default.decrypt(encryptedMessage, secretKey);
        return bytes.toString(enc_utf8_1.default);
    }
    static generateNonce(length = 16) {
        return CryptoJS.lib.WordArray.random(length).toString();
    }
    static base64Encode(message) {
        return enc_base64_1.default.stringify(enc_utf8_1.default.parse(message));
    }
    static base64Decode(encodedMessage) {
        return enc_base64_1.default.parse(encodedMessage).toString(enc_utf8_1.default);
    }
    static signHmacSHA256(payload, secret) {
        return CryptoJS.HmacSHA256(payload, secret).toString();
    }
    static hashAPIKey(apiKey, salt) {
        const saltValue = salt || CryptoJS.lib.WordArray.random(128 / 8).toString();
        const hash = CryptoJS.PBKDF2(apiKey, saltValue, {
            keySize: 256 / 32,
            iterations: 10000
        });
        return `${saltValue}:${hash.toString()}`;
    }
    static verifyAPIKey(apiKey, storedHash) {
        try {
            const [salt, hash] = storedHash.split(':');
            const computedHash = CryptoJS.PBKDF2(apiKey, salt, {
                keySize: 256 / 32,
                iterations: 10000
            });
            return computedHash.toString() === hash;
        }
        catch (error) {
            return false;
        }
    }
    static generateTimestampSignature(method, path, body, timestamp, apiSecret) {
        const message = `${timestamp}${method}${path}${body}`;
        return enc_base64_1.default.stringify((0, hmac_sha512_1.default)(message, apiSecret));
    }
    static validateChecksumAddress(address) {
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
exports.CryptoUtils = CryptoUtils;
class CryptoExamples {
    static demonstrateUsage() {
        console.log('=== Crypto-JS Usage Examples ===');
        const message = '{"symbol":"BTCUSD","side":"buy","amount":"0.1"}';
        const nonce = Date.now().toString();
        const path = '/api/v1/order';
        const privateKey = process.env.API_SECRET_KEY || 'demo-key-for-testing';
        const signature = CryptoUtils.signAPICall(message, nonce, path, privateKey);
        console.log('API Signature:', signature);
        const hash = CryptoUtils.hash('Hello World');
        console.log('SHA256 Hash:', hash);
        const encrypted = CryptoUtils.encrypt('Secret message', 'password123');
        console.log('Encrypted:', encrypted);
        const decrypted = CryptoUtils.decrypt(encrypted, 'password123');
        console.log('Decrypted:', decrypted);
        const apiNonce = CryptoUtils.generateNonce();
        console.log('Generated Nonce:', apiNonce);
        const timestamp = Date.now();
        const timestampSig = CryptoUtils.generateTimestampSignature('POST', '/api/v1/order', message, timestamp, process.env.API_SECRET_KEY || 'demo-key-for-testing');
        console.log('Timestamp Signature:', timestampSig);
    }
}
exports.CryptoExamples = CryptoExamples;
exports.default = CryptoUtils;
//# sourceMappingURL=cryptoUtils.js.map