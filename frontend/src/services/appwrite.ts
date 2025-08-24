import {Account, Client, Databases, Storage, Teams, Query} from 'appwrite';

// Appwrite configuration
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

// Database IDs
export const DATABASE_ID = '68a3b34a00375e270b14';
export const USERS_COLLECTION_ID = '68a3b34a00375e270b15';
export const CRYPTO_COLLECTION_ID = '68a3b3e2000dcc682c12';
export const NFT_COLLECTION_ID = '68a3b41400346ff40705';
export const PORTFOLIO_COLLECTION_ID = '68a3b43e001c44090ac6';

// Storage bucket IDs
export const PROFILE_IMAGES_BUCKET_ID = '68a3b463003bb9695087';
export const NFT_IMAGES_BUCKET_ID = '68a3b463003bb9695088';

// Authentication functions
export const authService = {
    // Create account
    async createAccount(email: string, password: string, name: string) {
        try {
            const response = await account.create(
                'unique()',
                email,
                password,
                name
            );
            
            // Create user profile in database
            await this.createUserProfile(response.$id, email, name);
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Sign in
    async signIn(email: string, password: string) {
        try {
            const response = await account.createEmailSession(email, password);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Sign out
    async signOut() {
        try {
            await account.deleteSessions();
        } catch (error) {
            throw error;
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            return await account.get();
        } catch {
            return null;
        }
    },

    // Create user profile in database
    async createUserProfile(userId: string, email: string, name: string) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                {
                    email,
                    name,
                    createdAt: new Date().toISOString(),
                    profileImage: '',
                    bio: '',
                    portfolioValue: 0,
                    isVerified: false
                }
            );
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }
};

// Database functions
export const databaseService = {
    // Get user profile
    async getUserProfile(userId: string) {
        try {
            return await databases.getDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId
            );
        } catch (error) {
            throw error;
        }
    },

    // Update user profile
    async updateUserProfile(userId: string, data: any) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                data
            );
        } catch (error) {
            throw error;
        }
    },

    // Get crypto data
    async getCryptoData() {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                CRYPTO_COLLECTION_ID
            );
        } catch (error) {
            throw error;
        }
    },

    // Get NFT collection
    async getNFTCollection() {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                NFT_COLLECTION_ID
            );
        } catch (error) {
            throw error;
        }
    },

    // Get user portfolio
    async getUserPortfolio(userId: string) {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                PORTFOLIO_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );
        } catch (error) {
            throw error;
        }
    }
};

// Storage functions
export const storageService = {
    // Upload profile image
    async uploadProfileImage(file: File, userId: string) {
        try {
            const response = await storage.createFile(
                PROFILE_IMAGES_BUCKET_ID,
                userId,
                file
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get file preview
    getFilePreview(bucketId: string, fileId: string) {
        return storage.getFileView(bucketId, fileId);
    },

    // Delete file
    async deleteFile(bucketId: string, fileId: string) {
        try {
            await storage.deleteFile(bucketId, fileId);
        } catch (error) {
            throw error;
        }
    }
};

export default client;
