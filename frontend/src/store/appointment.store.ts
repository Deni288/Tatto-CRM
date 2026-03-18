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
    deposit: number;
    createdAt: string;
    client?: Client;
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

const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error) return err.message;
    const apiErr = err as { response?: { data?: { error?: string } } };
    return apiErr.response?.data?.error ?? fallback;
};

export const useAppointmentStore = create<AppointmentState>()((set, get) => ({
    appointments: [],
    isLoading: false,
    error: null,

    fetchAppointments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<Appointment[]>('/appointments');
            set({ appointments: response.data, isLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err, 'Failed to fetch appointments'), isLoading: false });
        }
    },

    addAppointment: async (data: AppointmentFormData) => {
        try {
            const response = await api.post<Appointment>('/appointments', data);
            set({ appointments: [response.data, ...get().appointments] });
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: unknown) {
            set({ error: getErrorMessage(err, 'Failed to add appointment') });
            throw err;
        }
    },

    updateAppointment: async (id: string, data: Partial<AppointmentFormData>) => {
        const prev = get().appointments;
        set({
            appointments: prev.map((a) =>
                a.id === id ? { ...a, ...data } : a
            ),
        });
        try {
            const response = await api.put<Appointment>(`/appointments/${id}`, data);
            set({
                appointments: get().appointments.map((a) =>
                    a.id === id ? response.data : a
                ),
            });
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: unknown) {
            set({ appointments: prev, error: getErrorMessage(err, 'Failed to update appointment') });
            throw err;
        }
    },

    updateStatus: async (id: string, status: string) => {
        const prev = get().appointments;
        set({
            appointments: prev.map((a) =>
                a.id === id ? { ...a, status } : a
            ),
        });
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: unknown) {
            set({ appointments: prev, error: getErrorMessage(err, 'Failed to update appointment status') });
            throw err;
        }
    },

    deleteAppointment: async (id: string) => {
        const prev = get().appointments;
        set({ appointments: prev.filter((a) => a.id !== id) });
        try {
            await api.delete(`/appointments/${id}`);
            useDashboardStore.getState().fetchDashboardStats();
        } catch (err: unknown) {
            set({ appointments: prev, error: getErrorMessage(err, 'Failed to delete appointment') });
            throw err;
        }
    },
}));
