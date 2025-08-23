"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storageService_1 = __importDefault(require("../services/storageService"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 100 * 1024 * 1024
    },
    storage: multer_1.default.memoryStorage()
});
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file provided',
                details: 'Please include a file in the request'
            });
        }
        const { userId } = req.body;
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        if (userId) {
            storageService_1.default.setCurrentUser(userId);
        }
        const storageItem = await storageService_1.default.uploadFile(req.file.originalname, req.file.buffer, metadata);
        res.json({
            message: '📁 File uploaded successfully',
            file: storageItem,
            upload_id: storageItem.id
        });
        console.log(`📁 File uploaded via API: ${req.file.originalname}`);
    }
    catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            error: 'Failed to upload file',
            details: error.message
        });
    }
});
router.post('/upload/multiple', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No files provided',
                details: 'Please include files in the request'
            });
        }
        const { userId } = req.body;
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        if (userId) {
            storageService_1.default.setCurrentUser(userId);
        }
        const uploadedFiles = [];
        const errors = [];
        for (const file of files) {
            try {
                const storageItem = await storageService_1.default.uploadFile(file.originalname, file.buffer, metadata);
                uploadedFiles.push(storageItem);
            }
            catch (error) {
                errors.push({
                    filename: file.originalname,
                    error: error.message
                });
            }
        }
        res.json({
            message: `📁 Uploaded ${uploadedFiles.length} files successfully`,
            uploaded_files: uploadedFiles,
            upload_count: uploadedFiles.length,
            errors: errors.length > 0 ? errors : undefined
        });
        console.log(`📁 Multiple files uploaded via API: ${uploadedFiles.length} successful, ${errors.length} errors`);
    }
    catch (error) {
        console.error('Multiple file upload error:', error);
        res.status(500).json({
            error: 'Failed to upload files',
            details: error.message
        });
    }
});
router.get('/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { userId } = req.query;
        if (userId) {
            storageService_1.default.setCurrentUser(userId);
        }
        const fileData = await storageService_1.default.downloadFile(filename);
        const fileInfo = await storageService_1.default.getFileInfo(filename);
        if (fileInfo) {
            res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', fileData.length);
        }
        res.send(fileData);
        console.log(`📁 File downloaded via API: ${filename}`);
    }
    catch (error) {
        console.error('File download error:', error);
        res.status(404).json({
            error: 'File not found',
            details: error.message
        });
    }
});
router.delete('/files/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { userId } = req.body;
        if (userId) {
            storageService_1.default.setCurrentUser(userId);
        }
        await storageService_1.default.deleteFile(filename);
        res.json({
            message: `📁 File deleted successfully: ${filename}`,
            filename,
            status: 'deleted'
        });
        console.log(`📁 File deleted via API: ${filename}`);
    }
    catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({
            error: 'Failed to delete file',
            details: error.message
        });
    }
});
router.get('/files', async (req, res) => {
    try {
        const { directory = 'uploads' } = req.query;
        const files = await storageService_1.default.listFiles(directory);
        res.json({
            message: `Files in ${directory} directory`,
            directory,
            files,
            count: files.length
        });
    }
    catch (error) {
        console.error('List files error:', error);
        res.status(500).json({
            error: 'Failed to list files',
            details: error.message
        });
    }
});
router.get('/files/:filename/info', async (req, res) => {
    try {
        const { filename } = req.params;
        const fileInfo = await storageService_1.default.getFileInfo(filename);
        if (fileInfo) {
            res.json({
                message: `File information for ${filename}`,
                file: fileInfo
            });
        }
        else {
            res.status(404).json({
                error: 'File not found',
                filename
            });
        }
    }
    catch (error) {
        console.error('File info error:', error);
        res.status(500).json({
            error: 'Failed to get file information',
            details: error.message
        });
    }
});
router.get('/quota', async (req, res) => {
    try {
        const quota = await storageService_1.default.getStorageQuota();
        res.json({
            message: 'Storage quota information',
            quota: {
                total_gb: Math.round(quota.total / (1024 * 1024 * 1024) * 100) / 100,
                used_gb: Math.round(quota.used / (1024 * 1024 * 1024) * 100) / 100,
                available_gb: Math.round(quota.available / (1024 * 1024 * 1024) * 100) / 100,
                percentage_used: quota.percentage,
                ...quota
            }
        });
    }
    catch (error) {
        console.error('Storage quota error:', error);
        res.status(500).json({
            error: 'Failed to get storage quota',
            details: error.message
        });
    }
});
router.post('/backup', async (req, res) => {
    try {
        const { name = 'storage_backup', userId } = req.body;
        if (userId) {
            storageService_1.default.setCurrentUser(userId);
        }
        const backupName = await storageService_1.default.createBackup(name);
        res.json({
            message: '💾 Backup created successfully',
            backup_name: backupName,
            created_at: new Date().toISOString()
        });
        console.log(`💾 Backup created via API: ${backupName}`);
    }
    catch (error) {
        console.error('Backup creation error:', error);
        res.status(500).json({
            error: 'Failed to create backup',
            details: error.message
        });
    }
});
router.get('/backups', async (req, res) => {
    try {
        const backups = await storageService_1.default.listBackups();
        res.json({
            message: 'Available backups',
            backups,
            count: backups.length
        });
    }
    catch (error) {
        console.error('List backups error:', error);
        res.status(500).json({
            error: 'Failed to list backups',
            details: error.message
        });
    }
});
router.get('/upload/progress/:uploadId', (req, res) => {
    try {
        const { uploadId } = req.params;
        const progress = storageService_1.default.getUploadProgress(uploadId);
        if (progress) {
            res.json({
                message: 'Upload progress',
                progress
            });
        }
        else {
            res.status(404).json({
                error: 'Upload not found',
                upload_id: uploadId
            });
        }
    }
    catch (error) {
        console.error('Upload progress error:', error);
        res.status(500).json({
            error: 'Failed to get upload progress',
            details: error.message
        });
    }
});
router.get('/upload/progress', (req, res) => {
    try {
        const allProgress = storageService_1.default.getAllUploadProgress();
        res.json({
            message: 'All upload progress',
            uploads: allProgress,
            count: allProgress.length
        });
    }
    catch (error) {
        console.error('All upload progress error:', error);
        res.status(500).json({
            error: 'Failed to get upload progress',
            details: error.message
        });
    }
});
router.post('/cleanup/temp', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            storageService_1.default.setCurrentUser(userId);
        }
        await storageService_1.default.cleanupTempFiles();
        res.json({
            message: '🧹 Temporary files cleaned up successfully',
            status: 'completed'
        });
        console.log('🧹 Temporary files cleaned up via API');
    }
    catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            error: 'Failed to cleanup temporary files',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=storageRoutes.js.map