import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

interface UploadConfig {
    cloudName: string;
    uploadPreset: string;
}

interface UseBookingImageUpload {
    imageUrl: string | null;
    previewUrl: string | null;
    isUploading: boolean;
    error: string | null;
    handleFileSelect: (file: File) => Promise<void>;
    clearImage: () => void;
}

export const useBookingImageUpload = (): UseBookingImageUpload => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = useCallback(async (file: File): Promise<void> => {
        setError(null);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only JPG, PNG and WebP images are allowed');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`Image must be smaller than ${MAX_SIZE_MB}MB`);
            return;
        }

        setPreviewUrl(URL.createObjectURL(file));
        setIsUploading(true);

        try {
            const { data: config } = await axios.get<UploadConfig>(`${API_URL}/upload/booking-config`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', config.uploadPreset);

            const { data } = await axios.post<{ secure_url: string }>(
                `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
                formData,
            );

            setImageUrl(data.secure_url);
        } catch {
            setError('Upload failed. Please try again.');
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const clearImage = useCallback((): void => {
        setImageUrl(null);
        setPreviewUrl(null);
        setError(null);
    }, []);

    return { imageUrl, previewUrl, isUploading, error, handleFileSelect, clearImage };
};
