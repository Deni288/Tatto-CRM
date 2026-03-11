import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { Appointment } from './appointment.store';

interface DashboardStats {
    todaysRevenue: number;
    upcomingAppointmentsCount: number;
    newClientsThisMonth: number;
    todaysAppointments: Appointment[];
}

interface DashboardState {
    stats: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
    fetchDashboardStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
    stats: null,
    isLoading: false,
    error: null,

    fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/dashboard/stats');
            set({ stats: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch dashboard stats', isLoading: false });
        }
    }
}));
