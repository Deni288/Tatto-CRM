import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { Client } from './client.store';

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
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
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
            const response = await api.post('/appointments', data);
            
            // To immediately display the client name without refetching the whole list, 
            // the backend just returns the appointment data usually.
            // Ideally backend expands client on post. For simplicity, we refetch all to guarantee relation population.
            get().fetchAppointments();
            
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to add appointment', isLoading: false });
            throw err;
        }
    }
}));
