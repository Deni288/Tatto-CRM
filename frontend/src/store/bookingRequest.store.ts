import { create } from 'zustand';
import axios from 'axios';
import { api } from '../api/axiosInstance';

export interface BookingRequest {
    id: string;
    artistId: string | null;
    name: string;
    email: string;
    phone: string;
    tattooIdea: string;
    referenceLink: string | null;
    referenceImageUrl: string | null;
    preferredMonth: string;
    status: string;
    createdAt: string;
}

export interface BookingRequestFormData {
    name: string;
    email: string;
    phone: string;
    tattooIdea: string;
    referenceLink?: string;
    referenceImageUrl?: string;
    preferredMonth: string;
}

interface BookingRequestState {
    requests: BookingRequest[];
    isLoading: boolean;
    error: string | null;
    fetchRequests: () => Promise<void>;
    submitRequest: (artistId: string, data: BookingRequestFormData) => Promise<void>;
    updateRequestStatus: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
    convertToClient: (id: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useBookingRequestStore = create<BookingRequestState>()((set, get) => ({
    requests: [],
    isLoading: false,
    error: null,

    fetchRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/booking-requests');
            set({ requests: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch booking requests', isLoading: false });
        }
    },

    // Public endpoint — uses raw axios (no auth token)
    submitRequest: async (artistId: string, data: BookingRequestFormData) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/booking-requests/${artistId}`, data);
            set({ isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to submit booking request';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    updateRequestStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/booking-requests/${id}/status`, { status });
            get().fetchRequests();
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to update request status', isLoading: false });
            throw err;
        }
    },

    convertToClient: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/booking-requests/${id}/convert`);
            get().fetchRequests();
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to convert request to client', isLoading: false });
            throw err;
        }
    },
}));
