import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { Appointment } from './appointment.store';
import { cacheAppointments, getCachedAppointments } from '../lib/offlineStorage';

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
            // Cache today's appointments for offline viewing
            if (response.data.todaysAppointments.length > 0) {
                cacheAppointments(response.data.todaysAppointments).catch(() => {});
            }
        } catch (err: unknown) {
            // Try loading cached appointments as offline fallback
            try {
                const cached = await getCachedAppointments();
                if (cached.length > 0) {
                    set({
                        stats: {
                            todaysRevenue: 0,
                            upcomingAppointmentsCount: 0,
                            newClientsThisMonth: 0,
                            todaysAppointments: cached.map((c) => ({
                            ...c,
                            client: {
                                firstName: c.clientName.split(' ')[0] ?? '',
                                lastName: c.clientName.split(' ').slice(1).join(' '),
                            },
                        })) as unknown as Appointment[],
                            monthlyRevenue: [],
                            appointmentsByStatus: [],
                        },
                        isLoading: false,
                        error: 'Offline — prikazani su spremljeni termini',
                    });
                    return;
                }
            } catch {
                // IndexedDB unavailable, fall through to error
            }
            const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
            set({ error: message, isLoading: false });
        }
    },
}));
