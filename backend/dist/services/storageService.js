"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const databaseService_1 = __importDefault(require("./databaseService"));
class StorageService extends events_1.EventEmitter {
    constructor() {
        super();
        this.uploads = new Map();
        this.currentUserId = null;
        this.maxFileSize = 100 * 1024 * 1024;
        this.maxStorage = 10 * 1024 * 1024 * 1024;
        this.basePath = path_1.default.join(process.cwd(), 'storage');
        this.ensureStorageDirectory();
    }
    setCurrentUser(userId) {
        this.currentUserId = userId;
    }
    async ensureStorageDirectory() {
        try {
            await fs_1.promises.mkdir(this.basePath, { recursive: true });
            const subdirs = ['uploads', 'temp', 'backups', 'logs', 'cache'];
            for (const subdir of subdirs) {
                await fs_1.promises.mkdir(path_1.default.join(this.basePath, subdir), { recursive: true });
            }
            console.log(`📁 Storage directory initialized at: ${this.basePath}`);
        }
        catch (error) {
            console.error('Failed to initialize storage directory:', error);
            throw error;
        }
    }
    async uploadFile(filename, data, metadata) {
        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (data.length > this.maxFileSize) {
            throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
        }
        const quota = await this.getStorageQuota();
        if (quota.used + data.length > quota.total) {
            throw new Error('Storage quota exceeded');
        }
        const filePath = path_1.default.join(this.basePath, 'uploads', filename);
        const sanitizedFilename = this.sanitizeFilename(filename);
        const finalPath = path_1.default.join(this.basePath, 'uploads', sanitizedFilename);
        try {
            const progress = {
                id: uploadId,
                filename: sanitizedFilename,
                bytesTransferred: 0,
                totalBytes: data.length,
                percentage: 0,
                status: 'uploading'
            };
            this.uploads.set(uploadId, progress);
            this.emit('uploadStarted', progress);
            const chunkSize = 8192;
            let offset = 0;
            await fs_1.promises.writeFile(finalPath, data);
            progress.bytesTransferred = data.length;
            progress.percentage = 100;
            progress.status = 'complete';
            this.uploads.set(uploadId, progress);
            this.emit('uploadComplete', progress);
            const stats = await fs_1.promises.stat(finalPath);
            const mimeType = this.getMimeType(sanitizedFilename);
            const storageItem = {
                id: uploadId,
                name: sanitizedFilename,
                type: 'file',
                size: stats.size,
                path: finalPath,
                mimeType,
                createdAt: stats.birthtime,
                updatedAt: stats.mtime,
                metadata
            };
            if (this.currentUserId) {
                await databaseService_1.default.logActivity(this.currentUserId, {
                    type: 'file_upload',
                    description: `Uploaded file: ${sanitizedFilename}`,
                    metadata: {
                        filename: sanitizedFilename,
                        size: stats.size,
                        mime_type: mimeType,
                        upload_id: uploadId
                    }
                });
            }
            console.log(`📁 File uploaded successfully: ${sanitizedFilename} (${stats.size} bytes)`);
            this.emit('fileUploaded', storageItem);
            return storageItem;
        }
        catch (error) {
            const progress = this.uploads.get(uploadId);
            if (progress) {
                progress.status = 'error';
                this.uploads.set(uploadId, progress);
                this.emit('uploadError', { progress, error });
            }
            console.error(`Failed to upload file ${filename}:`, error);
            throw error;
        }
    }
    async downloadFile(filename) {
        const filePath = path_1.default.join(this.basePath, 'uploads', filename);
        try {
            const data = await fs_1.promises.readFile(filePath);
            if (this.currentUserId) {
                await databaseService_1.default.logActivity(this.currentUserId, {
                    type: 'file_download',
                    description: `Downloaded file: ${filename}`,
                    metadata: { filename }
                });
            }
            console.log(`📁 File downloaded: ${filename}`);
            return data;
        }
        catch (error) {
            console.error(`Failed to download file ${filename}:`, error);
            throw new Error(`File not found: ${filename}`);
        }
    }
    async deleteFile(filename) {
        const filePath = path_1.default.join(this.basePath, 'uploads', filename);
        try {
            await fs_1.promises.unlink(filePath);
            if (this.currentUserId) {
                await databaseService_1.default.logActivity(this.currentUserId, {
                    type: 'file_delete',
                    description: `Deleted file: ${filename}`,
                    metadata: { filename }
                });
            }
            console.log(`📁 File deleted: ${filename}`);
            this.emit('fileDeleted', { filename });
        }
        catch (error) {
            console.error(`Failed to delete file ${filename}:`, error);
            throw new Error(`Failed to delete file: ${filename}`);
        }
    }
    async listFiles(directory = 'uploads') {
        const dirPath = path_1.default.join(this.basePath, directory);
        try {
            const files = await fs_1.promises.readdir(dirPath);
            const items = [];
            for (const file of files) {
                const filePath = path_1.default.join(dirPath, file);
                const stats = await fs_1.promises.stat(filePath);
                const item = {
                    id: `${Date.now()}_${file}`,
                    name: file,
                    type: stats.isDirectory() ? 'folder' : 'file',
                    size: stats.size,
                    path: filePath,
                    mimeType: stats.isFile() ? this.getMimeType(file) : undefined,
                    createdAt: stats.birthtime,
                    updatedAt: stats.mtime
                };
                items.push(item);
            }
            return items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        }
        catch (error) {
            console.error(`Failed to list files in ${directory}:`, error);
            return [];
        }
    }
    async getFileInfo(filename) {
        const filePath = path_1.default.join(this.basePath, 'uploads', filename);
        try {
            const stats = await fs_1.promises.stat(filePath);
            return {
                id: `info_${filename}`,
                name: filename,
                type: stats.isDirectory() ? 'folder' : 'file',
                size: stats.size,
                path: filePath,
                mimeType: this.getMimeType(filename),
                createdAt: stats.birthtime,
                updatedAt: stats.mtime
            };
        }
        catch (error) {
            return null;
        }
    }
    async getStorageQuota() {
        try {
            const used = await this.calculateDirectorySize(this.basePath);
            const available = this.maxStorage - used;
            const percentage = Math.round((used / this.maxStorage) * 100);
            return {
                total: this.maxStorage,
                used,
                available: Math.max(0, available),
                percentage: Math.min(100, percentage)
            };
        }
        catch (error) {
            console.error('Failed to calculate storage quota:', error);
            return {
                total: this.maxStorage,
                used: 0,
                available: this.maxStorage,
                percentage: 0
            };
        }
    }
    async calculateDirectorySize(dirPath) {
        let totalSize = 0;
        try {
            const items = await fs_1.promises.readdir(dirPath);
            for (const item of items) {
                const itemPath = path_1.default.join(dirPath, item);
                const stats = await fs_1.promises.stat(itemPath);
                if (stats.isDirectory()) {
                    totalSize += await this.calculateDirectorySize(itemPath);
                }
                else {
                    totalSize += stats.size;
                }
            }
        }
        catch (error) {
            console.error(`Error calculating size for ${dirPath}:`, error);
        }
        return totalSize;
    }
    async createBackup(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `${name}_${timestamp}.backup`;
        const backupPath = path_1.default.join(this.basePath, 'backups', backupName);
        try {
            const uploadsPath = path_1.default.join(this.basePath, 'uploads');
            const backupData = {
                timestamp: new Date().toISOString(),
                name,
                files: await this.listFiles('uploads')
            };
            await fs_1.promises.writeFile(backupPath, JSON.stringify(backupData, null, 2));
            if (this.currentUserId) {
                await databaseService_1.default.logActivity(this.currentUserId, {
                    type: 'backup_created',
                    description: `Created backup: ${backupName}`,
                    metadata: { backup_name: backupName }
                });
            }
            console.log(`💾 Backup created: ${backupName}`);
            this.emit('backupCreated', { name: backupName, path: backupPath });
            return backupName;
        }
        catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Backup creation failed');
        }
    }
    async listBackups() {
        const backupsPath = path_1.default.join(this.basePath, 'backups');
        try {
            const files = await fs_1.promises.readdir(backupsPath);
            return files.filter(file => file.endsWith('.backup'));
        }
        catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }
    getUploadProgress(uploadId) {
        return this.uploads.get(uploadId) || null;
    }
    getAllUploadProgress() {
        return Array.from(this.uploads.values());
    }
    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    }
    getMimeType(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        const mimeTypes = {
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.zip': 'application/zip',
            '.csv': 'text/csv'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
    async cleanupTempFiles() {
        const tempPath = path_1.default.join(this.basePath, 'temp');
        try {
            const files = await fs_1.promises.readdir(tempPath);
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            for (const file of files) {
                const filePath = path_1.default.join(tempPath, file);
                const stats = await fs_1.promises.stat(filePath);
                if (stats.mtime.getTime() < oneDayAgo) {
                    await fs_1.promises.unlink(filePath);
                    console.log(`🧹 Cleaned up temp file: ${file}`);
                }
            }
        }
        catch (error) {
            console.error('Failed to cleanup temp files:', error);
        }
    }
}
exports.StorageService = StorageService;
exports.default = new StorageService();
//# sourceMappingURL=storageService.js.map