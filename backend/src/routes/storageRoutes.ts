import { Router, Request, Response } from 'express';
import multer from 'multer';
import storageService from '../services/storageService';

const router = Router();

// Configure multer for file uploads
const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    storage: multer.memoryStorage()
});

// Upload file
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
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
            storageService.setCurrentUser(userId);
        }

        const storageItem = await storageService.uploadFile(
            req.file.originalname,
            req.file.buffer,
            metadata
        );

        res.json({
            message: '📁 File uploaded successfully',
            file: storageItem,
            upload_id: storageItem.id
        });

        console.log(`📁 File uploaded via API: ${req.file.originalname}`);
    } catch (error: any) {
        console.error('File upload error:', error);
        res.status(500).json({
            error: 'Failed to upload file',
            details: error.message
        });
    }
});

// Upload multiple files
router.post('/upload/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No files provided',
                details: 'Please include files in the request'
            });
        }

        const { userId } = req.body;
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

        if (userId) {
            storageService.setCurrentUser(userId);
        }

        const uploadedFiles = [];
        const errors = [];

        for (const file of files) {
            try {
                const storageItem = await storageService.uploadFile(
                    file.originalname,
                    file.buffer,
                    metadata
                );
                uploadedFiles.push(storageItem);
            } catch (error: any) {
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
    } catch (error: any) {
        console.error('Multiple file upload error:', error);
        res.status(500).json({
            error: 'Failed to upload files',
            details: error.message
        });
    }
});

// Download file
router.get('/download/:filename', async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const { userId } = req.query;

        if (userId) {
            storageService.setCurrentUser(userId as string);
        }

        const fileData = await storageService.downloadFile(filename);
        const fileInfo = await storageService.getFileInfo(filename);

        if (fileInfo) {
            res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', fileData.length);
        }

        res.send(fileData);
        console.log(`📁 File downloaded via API: ${filename}`);
    } catch (error: any) {
        console.error('File download error:', error);
        res.status(404).json({
            error: 'File not found',
            details: error.message
        });
    }
});

// Delete file
router.delete('/files/:filename', async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const { userId } = req.body;

        if (userId) {
            storageService.setCurrentUser(userId);
        }

        await storageService.deleteFile(filename);

        res.json({
            message: `📁 File deleted successfully: ${filename}`,
            filename,
            status: 'deleted'
        });

        console.log(`📁 File deleted via API: ${filename}`);
    } catch (error: any) {
        console.error('File delete error:', error);
        res.status(500).json({
            error: 'Failed to delete file',
            details: error.message
        });
    }
});

// List files
router.get('/files', async (req: Request, res: Response) => {
    try {
        const { directory = 'uploads' } = req.query;
        const files = await storageService.listFiles(directory as string);

        res.json({
            message: `Files in ${directory} directory`,
            directory,
            files,
            count: files.length
        });
    } catch (error: any) {
        console.error('List files error:', error);
        res.status(500).json({
            error: 'Failed to list files',
            details: error.message
        });
    }
});

// Get file info
router.get('/files/:filename/info', async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const fileInfo = await storageService.getFileInfo(filename);

        if (fileInfo) {
            res.json({
                message: `File information for ${filename}`,
                file: fileInfo
            });
        } else {
            res.status(404).json({
                error: 'File not found',
                filename
            });
        }
    } catch (error: any) {
        console.error('File info error:', error);
        res.status(500).json({
            error: 'Failed to get file information',
            details: error.message
        });
    }
});

// Get storage quota
router.get('/quota', async (req: Request, res: Response) => {
    try {
        const quota = await storageService.getStorageQuota();

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
    } catch (error: any) {
        console.error('Storage quota error:', error);
        res.status(500).json({
            error: 'Failed to get storage quota',
            details: error.message
        });
    }
});

// Create backup
router.post('/backup', async (req: Request, res: Response) => {
    try {
        const { name = 'storage_backup', userId } = req.body;

        if (userId) {
            storageService.setCurrentUser(userId);
        }

        const backupName = await storageService.createBackup(name);

        res.json({
            message: '💾 Backup created successfully',
            backup_name: backupName,
            created_at: new Date().toISOString()
        });

        console.log(`💾 Backup created via API: ${backupName}`);
    } catch (error: any) {
        console.error('Backup creation error:', error);
        res.status(500).json({
            error: 'Failed to create backup',
            details: error.message
        });
    }
});

// List backups
router.get('/backups', async (req: Request, res: Response) => {
    try {
        const backups = await storageService.listBackups();

        res.json({
            message: 'Available backups',
            backups,
            count: backups.length
        });
    } catch (error: any) {
        console.error('List backups error:', error);
        res.status(500).json({
            error: 'Failed to list backups',
            details: error.message
        });
    }
});

// Get upload progress
router.get('/upload/progress/:uploadId', (req: Request, res: Response) => {
    try {
        const { uploadId } = req.params;
        const progress = storageService.getUploadProgress(uploadId);

        if (progress) {
            res.json({
                message: 'Upload progress',
                progress
            });
        } else {
            res.status(404).json({
                error: 'Upload not found',
                upload_id: uploadId
            });
        }
    } catch (error: any) {
        console.error('Upload progress error:', error);
        res.status(500).json({
            error: 'Failed to get upload progress',
            details: error.message
        });
    }
});

// Get all upload progress
router.get('/upload/progress', (req: Request, res: Response) => {
    try {
        const allProgress = storageService.getAllUploadProgress();

        res.json({
            message: 'All upload progress',
            uploads: allProgress,
            count: allProgress.length
        });
    } catch (error: any) {
        console.error('All upload progress error:', error);
        res.status(500).json({
            error: 'Failed to get upload progress',
            details: error.message
        });
    }
});

// Cleanup temporary files
router.post('/cleanup/temp', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            storageService.setCurrentUser(userId);
        }

        await storageService.cleanupTempFiles();

        res.json({
            message: '🧹 Temporary files cleaned up successfully',
            status: 'completed'
        });

        console.log('🧹 Temporary files cleaned up via API');
    } catch (error: any) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            error: 'Failed to cleanup temporary files',
            details: error.message
        });
    }
});

export default router;