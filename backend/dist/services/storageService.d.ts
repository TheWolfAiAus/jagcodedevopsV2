import { EventEmitter } from 'events';
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
export declare class StorageService extends EventEmitter {
    private basePath;
    private uploads;
    private currentUserId;
    private readonly maxFileSize;
    private readonly maxStorage;
    constructor();
    setCurrentUser(userId: string): void;
    private ensureStorageDirectory;
    uploadFile(filename: string, data: Buffer, metadata?: Record<string, any>): Promise<StorageItem>;
    downloadFile(filename: string): Promise<Buffer>;
    deleteFile(filename: string): Promise<void>;
    listFiles(directory?: string): Promise<StorageItem[]>;
    getFileInfo(filename: string): Promise<StorageItem | null>;
    getStorageQuota(): Promise<StorageQuota>;
    private calculateDirectorySize;
    createBackup(name: string): Promise<string>;
    listBackups(): Promise<string[]>;
    getUploadProgress(uploadId: string): UploadProgress | null;
    getAllUploadProgress(): UploadProgress[];
    private sanitizeFilename;
    private getMimeType;
    cleanupTempFiles(): Promise<void>;
}
declare const _default: StorageService;
export default _default;
//# sourceMappingURL=storageService.d.ts.map