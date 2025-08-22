import {EventEmitter} from 'events';
import {promises as fs} from 'fs';
import path from 'path';
import databaseService from './databaseService';

interface StorageItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size: number;
    path: string;
    mimeType?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}

interface StorageQuota {
    total: number;
    used: number;
    available: number;
    percentage: number;
}

interface UploadProgress {
    id: string;
    filename: string;
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
    status: 'uploading' | 'complete' | 'error';
}

export class StorageService extends EventEmitter {
    private basePath: string;
    private uploads: Map<string, UploadProgress> = new Map();
    private currentUserId: string | null = null;
    private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
    private readonly maxStorage = 10 * 1024 * 1024 * 1024; // 10GB

    constructor() {
        super();
        this.basePath = path.join(process.cwd(), 'storage');
        this.ensureStorageDirectory();
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    private async ensureStorageDirectory(): Promise<void> {
        try {
            await fs.mkdir(this.basePath, { recursive: true });
            
            // Create subdirectories
            const subdirs = ['uploads', 'temp', 'backups', 'logs', 'cache'];
            for (const subdir of subdirs) {
                await fs.mkdir(path.join(this.basePath, subdir), { recursive: true });
            }
            
            console.log(`📁 Storage directory initialized at: ${this.basePath}`);
        } catch (error) {
            console.error('Failed to initialize storage directory:', error);
            throw error;
        }
    }

    async uploadFile(filename: string, data: Buffer, metadata?: Record<string, any>): Promise<StorageItem> {
        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        if (data.length > this.maxFileSize) {
            throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        const quota = await this.getStorageQuota();
        if (quota.used + data.length > quota.total) {
            throw new Error('Storage quota exceeded');
        }

        const filePath = path.join(this.basePath, 'uploads', filename);
        const sanitizedFilename = this.sanitizeFilename(filename);
        const finalPath = path.join(this.basePath, 'uploads', sanitizedFilename);

        try {
            // Create upload progress tracker
            const progress: UploadProgress = {
                id: uploadId,
                filename: sanitizedFilename,
                bytesTransferred: 0,
                totalBytes: data.length,
                percentage: 0,
                status: 'uploading'
            };
            this.uploads.set(uploadId, progress);
            this.emit('uploadStarted', progress);

            // Simulate chunked upload for progress tracking
            const chunkSize = 8192; // 8KB chunks
            let offset = 0;

            await fs.writeFile(finalPath, data);

            // Update progress to complete
            progress.bytesTransferred = data.length;
            progress.percentage = 100;
            progress.status = 'complete';
            this.uploads.set(uploadId, progress);
            this.emit('uploadComplete', progress);

            // Get file stats
            const stats = await fs.stat(finalPath);
            const mimeType = this.getMimeType(sanitizedFilename);

            const storageItem: StorageItem = {
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

            // Log to database
            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
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
        } catch (error) {
            // Update progress to error
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

    async downloadFile(filename: string): Promise<Buffer> {
        const filePath = path.join(this.basePath, 'uploads', filename);
        
        try {
            const data = await fs.readFile(filePath);
            
            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'file_download',
                    description: `Downloaded file: ${filename}`,
                    metadata: { filename }
                });
            }
            
            console.log(`📁 File downloaded: ${filename}`);
            return data;
        } catch (error) {
            console.error(`Failed to download file ${filename}:`, error);
            throw new Error(`File not found: ${filename}`);
        }
    }

    async deleteFile(filename: string): Promise<void> {
        const filePath = path.join(this.basePath, 'uploads', filename);
        
        try {
            await fs.unlink(filePath);
            
            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'file_delete',
                    description: `Deleted file: ${filename}`,
                    metadata: { filename }
                });
            }
            
            console.log(`📁 File deleted: ${filename}`);
            this.emit('fileDeleted', { filename });
        } catch (error) {
            console.error(`Failed to delete file ${filename}:`, error);
            throw new Error(`Failed to delete file: ${filename}`);
        }
    }

    async listFiles(directory = 'uploads'): Promise<StorageItem[]> {
        const dirPath = path.join(this.basePath, directory);
        
        try {
            const files = await fs.readdir(dirPath);
            const items: StorageItem[] = [];

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await fs.stat(filePath);
                
                const item: StorageItem = {
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
        } catch (error) {
            console.error(`Failed to list files in ${directory}:`, error);
            return [];
        }
    }

    async getFileInfo(filename: string): Promise<StorageItem | null> {
        const filePath = path.join(this.basePath, 'uploads', filename);
        
        try {
            const stats = await fs.stat(filePath);
            
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
        } catch (error) {
            return null;
        }
    }

    async getStorageQuota(): Promise<StorageQuota> {
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
        } catch (error) {
            console.error('Failed to calculate storage quota:', error);
            return {
                total: this.maxStorage,
                used: 0,
                available: this.maxStorage,
                percentage: 0
            };
        }
    }

    private async calculateDirectorySize(dirPath: string): Promise<number> {
        let totalSize = 0;
        
        try {
            const items = await fs.readdir(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);
                
                if (stats.isDirectory()) {
                    totalSize += await this.calculateDirectorySize(itemPath);
                } else {
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            console.error(`Error calculating size for ${dirPath}:`, error);
        }
        
        return totalSize;
    }

    async createBackup(name: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `${name}_${timestamp}.backup`;
        const backupPath = path.join(this.basePath, 'backups', backupName);
        
        try {
            // Create a simple backup (in production, use proper archiving)
            const uploadsPath = path.join(this.basePath, 'uploads');
            const backupData = {
                timestamp: new Date().toISOString(),
                name,
                files: await this.listFiles('uploads')
            };
            
            await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
            
            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'backup_created',
                    description: `Created backup: ${backupName}`,
                    metadata: { backup_name: backupName }
                });
            }
            
            console.log(`💾 Backup created: ${backupName}`);
            this.emit('backupCreated', { name: backupName, path: backupPath });
            
            return backupName;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Backup creation failed');
        }
    }

    async listBackups(): Promise<string[]> {
        const backupsPath = path.join(this.basePath, 'backups');
        
        try {
            const files = await fs.readdir(backupsPath);
            return files.filter(file => file.endsWith('.backup'));
        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }

    getUploadProgress(uploadId: string): UploadProgress | null {
        return this.uploads.get(uploadId) || null;
    }

    getAllUploadProgress(): UploadProgress[] {
        return Array.from(this.uploads.values());
    }

    private sanitizeFilename(filename: string): string {
        return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    private getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes: Record<string, string> = {
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

    async cleanupTempFiles(): Promise<void> {
        const tempPath = path.join(this.basePath, 'temp');
        
        try {
            const files = await fs.readdir(tempPath);
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            for (const file of files) {
                const filePath = path.join(tempPath, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime.getTime() < oneDayAgo) {
                    await fs.unlink(filePath);
                    console.log(`🧹 Cleaned up temp file: ${file}`);
                }
            }
        } catch (error) {
            console.error('Failed to cleanup temp files:', error);
        }
    }
}

export default new StorageService();