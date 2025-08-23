"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const speechService_1 = __importDefault(require("../services/speechService"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        }
        else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});
router.post('/connect', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                error: 'User ID is required'
            });
        }
        speechService_1.default.setCurrentUser(userId);
        await speechService_1.default.connect();
        res.json({
            message: 'Speech service connected successfully',
            status: 'connected',
            available_commands: speechService_1.default.getAvailableCommands()
        });
        console.log(`🎤 Speech service connected for user: ${userId}`);
    }
    catch (error) {
        console.error('Speech connection error:', error);
        res.status(500).json({
            error: 'Failed to connect speech service',
            details: error.message
        });
    }
});
router.post('/disconnect', async (req, res) => {
    try {
        await speechService_1.default.disconnect();
        res.json({
            message: 'Speech service disconnected successfully',
            status: 'disconnected'
        });
        console.log('🎤 Speech service disconnected');
    }
    catch (error) {
        console.error('Speech disconnection error:', error);
        res.status(500).json({
            error: 'Failed to disconnect speech service',
            details: error.message
        });
    }
});
router.post('/audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Audio file is required'
            });
        }
        if (!speechService_1.default.isServiceConnected()) {
            return res.status(400).json({
                error: 'Speech service is not connected. Connect first.'
            });
        }
        speechService_1.default.sendAudioData(req.file.buffer);
        res.json({
            message: 'Audio data processed',
            audio_size: req.file.size,
            mime_type: req.file.mimetype
        });
    }
    catch (error) {
        console.error('Audio processing error:', error);
        res.status(500).json({
            error: 'Failed to process audio',
            details: error.message
        });
    }
});
router.get('/status', (req, res) => {
    try {
        const isConnected = speechService_1.default.isServiceConnected();
        const availableCommands = speechService_1.default.getAvailableCommands();
        res.json({
            status: isConnected ? 'connected' : 'disconnected',
            is_connected: isConnected,
            available_commands: availableCommands,
            total_commands: availableCommands.length
        });
    }
    catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            error: 'Failed to get status',
            details: error.message
        });
    }
});
router.get('/commands', (req, res) => {
    try {
        const commands = speechService_1.default.getAvailableCommands();
        res.json({
            message: 'Available voice commands',
            commands: commands.map(cmd => ({
                command: cmd,
                description: getCommandDescription(cmd)
            })),
            total: commands.length
        });
    }
    catch (error) {
        console.error('Commands retrieval error:', error);
        res.status(500).json({
            error: 'Failed to get commands',
            details: error.message
        });
    }
});
router.post('/commands', async (req, res) => {
    try {
        const { command, description } = req.body;
        if (!command) {
            return res.status(400).json({
                error: 'Command text is required'
            });
        }
        const customAction = async () => {
            console.log(`🎤 Custom command executed: ${command}`);
        };
        speechService_1.default.addCustomCommand(command, customAction);
        res.status(201).json({
            message: 'Custom command added successfully',
            command,
            description: description || 'Custom user command'
        });
        console.log(`🎤 Custom command added: "${command}"`);
    }
    catch (error) {
        console.error('Custom command error:', error);
        res.status(500).json({
            error: 'Failed to add custom command',
            details: error.message
        });
    }
});
router.delete('/commands/:command', (req, res) => {
    try {
        const { command } = req.params;
        const removed = speechService_1.default.removeCommand(command);
        if (removed) {
            res.json({
                message: 'Command removed successfully',
                command
            });
        }
        else {
            res.status(404).json({
                error: 'Command not found',
                command
            });
        }
    }
    catch (error) {
        console.error('Command removal error:', error);
        res.status(500).json({
            error: 'Failed to remove command',
            details: error.message
        });
    }
});
router.post('/test', async (req, res) => {
    try {
        const { text_command } = req.body;
        if (!text_command) {
            return res.status(400).json({
                error: 'text_command is required for testing'
            });
        }
        console.log(`🎤 Testing voice command: "${text_command}"`);
        res.json({
            message: 'Voice command test completed',
            tested_command: text_command,
            note: 'Check server logs for execution details'
        });
    }
    catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            error: 'Failed to test command',
            details: error.message
        });
    }
});
function getCommandDescription(command) {
    const descriptions = {
        'start mining': 'Start cryptocurrency mining operations',
        'stop mining': 'Stop cryptocurrency mining operations',
        'find nft opportunities': 'Search for profitable NFT opportunities',
        'show dashboard': 'Display the main dashboard',
        'get portfolio value': 'Get current total portfolio value',
        'emergency stop': 'Emergency stop all operations immediately',
        'start profit strategy': 'Start automated profit-maximizing strategy'
    };
    return descriptions[command] || 'Custom voice command';
}
exports.default = router;
//# sourceMappingURL=speechRoutes.js.map