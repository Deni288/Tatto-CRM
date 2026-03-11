import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { Client } from './client.store';
import { useDashboardStore } from './dashboard.store';

export interface Appointment {
    id: string;
    clientId: string;
    artistId: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
    price: number | null;
    depositAmount: number | null;
    depositPaid: boolean;
    createdAt: string;
    client?: Client; // the included client relation
}

export interface AppointmentFormData {
    clientId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    price?: number | null;
    depositAmount?: number | null;
}

interface AppointmentState {
    appointments: Appointment[];
    isLoading: boolean;
    error: string | null;
    fetchAppointments: () => Promise<void>;
    addAppointment: (data: AppointmentFormData) => Promise<void>;
    updateAppointment: (id: string, data: Partial<AppointmentFormData>) => Promise<void>;
    updateStatus: (id: string, status: string) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>()((set, get) => ({
    appointments: [],
    isLoading: false,
    error: null,

    fetchAppointments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/appointments');
            set({ appointments: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch appointments', isLoading: false });
        }
    },

    addAppointment: async (data: AppointmentFormData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/appointments', data);
            
            // Refresh list and dashboard stats
            get().fetchAppointments();
            useDashboardStore.getState().fetchDashboardStats();
            
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to add appointment', isLoading: false });
            throw err;
        }
    },

    updateAppointment: async (id: string, data: Partial<AppointmentFormData>) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/appointments/${id}`, data);
            get().fetchAppointments();
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to update appointment', isLoading: false });
            throw err;
        }
    },

    updateStatus: async (id: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            get().fetchAppointments();
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to update appointment status', isLoading: false });
            throw err;
        }
    },

    deleteAppointment: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/appointments/${id}`);
            get().fetchAppointments();
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to delete appointment', isLoading: false });
            throw err;
        }
    }
}));
