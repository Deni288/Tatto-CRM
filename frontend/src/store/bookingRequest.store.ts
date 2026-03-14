import { create } from 'zustand';
import axios from 'axios';
import { api } from '../api/axiosInstance';

export interface BookingRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    tattooIdea: string;
    referenceLink: string | null;
    preferredMonth: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookingRequestFormData {
    name: string;
    email: string;
    phone: string;
    tattooIdea: string;
    referenceLink?: string;
    preferredMonth: string;
}

interface BookingRequestState {
    requests: BookingRequest[];
    isLoading: boolean;
    error: string | null;
    fetchRequests: () => Promise<void>;
    submitRequest: (data: BookingRequestFormData) => Promise<void>;
    updateRequestStatus: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
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
    submitRequest: async (data: BookingRequestFormData) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/booking-requests`, data);
            set({ isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to submit booking request', isLoading: false });
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
}));
