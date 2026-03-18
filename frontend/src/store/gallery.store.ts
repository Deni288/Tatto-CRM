import { create } from 'zustand';
import { api } from '../api/axiosInstance';

export interface GalleryImage {
    id: string;
    clientId: string;
    imageUrl: string;
    description: string | null;
    createdAt: string;
}

export interface GalleryImageData {
    imageUrl: string;
    description?: string | null;
    cloudinaryPublicId?: string;
}

interface GalleryState {
    images: GalleryImage[];
    isLoading: boolean;
    error: string | null;
    fetchGallery: (clientId: string) => Promise<void>;
    addImage: (clientId: string, data: GalleryImageData) => Promise<void>;
    deleteImage: (clientId: string, imageId: string) => Promise<void>;
}

export const useGalleryStore = create<GalleryState>()((set, get) => ({
    images: [],
    isLoading: false,
    error: null,

    fetchGallery: async (clientId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/clients/${clientId}/gallery`);
            set({ images: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch gallery', isLoading: false });
        }
    },

    addImage: async (clientId: string, data: GalleryImageData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/clients/${clientId}/gallery`, data);
            get().fetchGallery(clientId);
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to add image', isLoading: false });
            throw err;
        }
    },

    deleteImage: async (clientId: string, imageId: string) => {
        try {
            await api.delete(`/clients/${clientId}/gallery/${imageId}`);
            get().fetchGallery(clientId);
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to delete image' });
            throw err;
        }
    },
}));
