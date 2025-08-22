import { Router, Request, Response } from 'express';
import speechService from '../services/speechService';
import multer from 'multer';

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Connect to speech service
router.post('/connect', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                error: 'User ID is required' 
            });
        }

        // Set the current user for the speech service
        speechService.setCurrentUser(userId);

        // Connect to Speechmatics
        await speechService.connect();

        res.json({
            message: 'Speech service connected successfully',
            status: 'connected',
            available_commands: speechService.getAvailableCommands()
        });

        console.log(`🎤 Speech service connected for user: ${userId}`);
    } catch (error: any) {
        console.error('Speech connection error:', error);
        res.status(500).json({ 
            error: 'Failed to connect speech service',
            details: error.message 
        });
    }
});

// Disconnect from speech service
router.post('/disconnect', async (req: Request, res: Response) => {
    try {
        await speechService.disconnect();

        res.json({
            message: 'Speech service disconnected successfully',
            status: 'disconnected'
        });

        console.log('🎤 Speech service disconnected');
    } catch (error: any) {
        console.error('Speech disconnection error:', error);
        res.status(500).json({ 
            error: 'Failed to disconnect speech service',
            details: error.message 
        });
    }
});

// Send audio data for real-time processing
router.post('/audio', upload.single('audio'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'Audio file is required' 
            });
        }

        if (!speechService.isServiceConnected()) {
            return res.status(400).json({ 
                error: 'Speech service is not connected. Connect first.' 
            });
        }

        // Send audio data to speech service
        speechService.sendAudioData(req.file.buffer);

        res.json({
            message: 'Audio data processed',
            audio_size: req.file.size,
            mime_type: req.file.mimetype
        });
    } catch (error: any) {
        console.error('Audio processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process audio',
            details: error.message 
        });
    }
});

// Get speech service status
router.get('/status', (req: Request, res: Response) => {
    try {
        const isConnected = speechService.isServiceConnected();
        const availableCommands = speechService.getAvailableCommands();

        res.json({
            status: isConnected ? 'connected' : 'disconnected',
            is_connected: isConnected,
            available_commands: availableCommands,
            total_commands: availableCommands.length
        });
    } catch (error: any) {
        console.error('Status check error:', error);
        res.status(500).json({ 
            error: 'Failed to get status',
            details: error.message 
        });
    }
});

// Get available voice commands
router.get('/commands', (req: Request, res: Response) => {
    try {
        const commands = speechService.getAvailableCommands();

        res.json({
            message: 'Available voice commands',
            commands: commands.map(cmd => ({
                command: cmd,
                description: getCommandDescription(cmd)
            })),
            total: commands.length
        });
    } catch (error: any) {
        console.error('Commands retrieval error:', error);
        res.status(500).json({ 
            error: 'Failed to get commands',
            details: error.message 
        });
    }
});

// Add custom voice command
router.post('/commands', async (req: Request, res: Response) => {
    try {
        const { command, description } = req.body;

        if (!command) {
            return res.status(400).json({ 
                error: 'Command text is required' 
            });
        }

        // Create a simple action for the custom command
        const customAction = async () => {
            console.log(`🎤 Custom command executed: ${command}`);
            // You could add more sophisticated custom actions here
        };

        speechService.addCustomCommand(command, customAction);

        res.status(201).json({
            message: 'Custom command added successfully',
            command,
            description: description || 'Custom user command'
        });

        console.log(`🎤 Custom command added: "${command}"`);
    } catch (error: any) {
        console.error('Custom command error:', error);
        res.status(500).json({ 
            error: 'Failed to add custom command',
            details: error.message 
        });
    }
});

// Remove voice command
router.delete('/commands/:command', (req: Request, res: Response) => {
    try {
        const { command } = req.params;
        const removed = speechService.removeCommand(command);

        if (removed) {
            res.json({
                message: 'Command removed successfully',
                command
            });
        } else {
            res.status(404).json({
                error: 'Command not found',
                command
            });
        }
    } catch (error: any) {
        console.error('Command removal error:', error);
        res.status(500).json({ 
            error: 'Failed to remove command',
            details: error.message 
        });
    }
});

// Test speech service (for development)
router.post('/test', async (req: Request, res: Response) => {
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
    } catch (error: any) {
        console.error('Test error:', error);
        res.status(500).json({ 
            error: 'Failed to test command',
            details: error.message 
        });
    }
});

// Helper function to provide command descriptions
function getCommandDescription(command: string): string {
    const descriptions: { [key: string]: string } = {
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

export default router;