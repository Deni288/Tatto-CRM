import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { Appointment } from './appointment.store';

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface AppointmentByStatus {
    status: string;
    count: number;
    color: string;
}

interface DashboardStats {
    todaysRevenue: number;
    upcomingAppointmentsCount: number;
    newClientsThisMonth: number;
    todaysAppointments: Appointment[];
    monthlyRevenue: MonthlyRevenue[];
    appointmentsByStatus: AppointmentByStatus[];
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
            const response = await api.get<DashboardStats>('/dashboard/stats');
            set({ stats: response.data, isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
            set({ error: message, isLoading: false });
        }
    },
}));
