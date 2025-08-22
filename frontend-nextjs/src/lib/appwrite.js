"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionsService = exports.databaseService = exports.authService = exports.FUNCTION_IDS = exports.BUCKETS = exports.COLLECTIONS = exports.DATABASE_ID = exports.functions = exports.storage = exports.databases = exports.account = void 0;
var appwrite_1 = require("appwrite");
// Appwrite configuration with real endpoints
var client = new appwrite_1.Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057');
// Initialize Appwrite services
exports.account = new appwrite_1.Account(client);
exports.databases = new appwrite_1.Databases(client);
exports.storage = new appwrite_1.Storage(client);
exports.functions = new appwrite_1.Functions(client);
// Database configuration
exports.DATABASE_ID = 'jagcode_main';
exports.COLLECTIONS = {
    USERS: 'users',
    CRYPTO_DATA: 'crypto_data',
    NFT_COLLECTION: 'nft_collection',
    USER_PORTFOLIOS: 'user_portfolios',
    PRICE_ALERTS: 'price_alerts',
    TRANSACTIONS: 'transactions'
};
// Storage buckets
exports.BUCKETS = {
    PROFILE_IMAGES: 'profile_images',
    NFT_IMAGES: 'nft_images',
    DOCUMENTS: 'documents'
};
// Function IDs
exports.FUNCTION_IDS = {
    BACKEND_API: 'backend-api',
    CRYPTO_TRACKER: 'crypto-tracker',
    DEFI_ANALYZER: 'defi-analyzer'
};
// Authentication service
exports.authService = {
    createAccount: function (email, password, name) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Input validation
                        if (!email || !password || !name) {
                            throw new Error('Email, password, and name are required');
                        }
                        if (password.length < 8) {
                            throw new Error('Password must be at least 8 characters long');
                        }
                        if (!/\S+@\S+\.\S+/.test(email)) {
                            throw new Error('Please enter a valid email address');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, exports.account.create('unique()', email, password, name)];
                    case 2:
                        response = _a.sent();
                        // Create user profile in database
                        return [4 /*yield*/, exports.databases.createDocument(exports.DATABASE_ID, exports.COLLECTIONS.USERS, response.$id, {
                                email: email,
                                name: name.trim(),
                                profileImage: '',
                                bio: '',
                                portfolioValue: 0,
                                isVerified: false,
                                createdAt: new Date().toISOString()
                            })];
                    case 3:
                        // Create user profile in database
                        _a.sent();
                        return [2 /*return*/, response];
                    case 4:
                        error_1 = _a.sent();
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    signIn: function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Input validation
                        if (!email || !password) {
                            throw new Error('Email and password are required');
                        }
                        if (!/\S+@\S+\.\S+/.test(email)) {
                            throw new Error('Please enter a valid email address');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, exports.account.createEmailPasswordSession(email, password)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    signOut: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.account.deleteSessions()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Sign out error:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    getCurrentUser: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.account.get()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
// Database service
exports.databaseService = {
    getCryptoData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.databases.listDocuments(exports.DATABASE_ID, exports.COLLECTIONS.CRYPTO_DATA)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Get crypto data error:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    getUserPortfolio: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.databases.listDocuments(exports.DATABASE_ID, exports.COLLECTIONS.USER_PORTFOLIOS, [appwrite_1.Query.equal('userId', userId)])];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Get user portfolio error:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    createPriceAlert: function (userId, symbol, targetPrice, condition) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Input validation
                        if (!userId || !symbol || !targetPrice || !condition) {
                            throw new Error('All fields are required for price alert');
                        }
                        if (targetPrice <= 0) {
                            throw new Error('Target price must be greater than 0');
                        }
                        if (!['above', 'below'].includes(condition.toLowerCase())) {
                            throw new Error('Condition must be "above" or "below"');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, exports.databases.createDocument(exports.DATABASE_ID, exports.COLLECTIONS.PRICE_ALERTS, 'unique()', {
                                userId: userId,
                                symbol: symbol.toUpperCase().trim(),
                                targetPrice: targetPrice,
                                condition: condition.toLowerCase(),
                                isActive: true,
                                createdAt: new Date().toISOString()
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
};
// Functions service
exports.functionsService = {
    executeCryptoFunction: function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.functions.createExecution(exports.FUNCTION_IDS.CRYPTO_TRACKER, JSON.stringify(data))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Execute crypto function error:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    executeBackendAPI: function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.functions.createExecution(exports.FUNCTION_IDS.BACKEND_API, JSON.stringify({ endpoint: endpoint, data: data }))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Execute backend API error:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
exports.default = client;
