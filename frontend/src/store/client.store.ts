import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { ClientFormData } from '@tattoocrm/shared';
import type { Appointment } from './appointment.store';

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    tattooHistory?: string | null;
    customFields?: Record<string, unknown> | null;
    portalToken?: string | null;
    createdAt: string;
    appointments?: Appointment[];
}

interface Pagination {
    page: number;
    totalPages: number;
    total: number;
}

interface ClientState {
    clients: Client[];
    selectedClient: Client | null;
    isLoading: boolean;
    initialized: boolean;
    error: string | null;
    pagination: Pagination;
    fetchClients: (page?: number) => Promise<void>;
    fetchClientById: (id: string) => Promise<void>;
    addClient: (data: ClientFormData) => Promise<void>;
    updateClient: (id: string, data: ClientFormData) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
}

const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error) return err.message;
    const apiErr = err as { response?: { data?: { error?: string } } };
    return apiErr.response?.data?.error ?? fallback;
};

const LIMIT = 20;

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    selectedClient: null,
    isLoading: false,
    initialized: false,
    error: null,
    pagination: { page: 1, totalPages: 1, total: 0 },

    fetchClients: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<{ data: Client[]; total: number; page: number; totalPages: number }>(
                `/clients?page=${page}&limit=${LIMIT}`
            );
            const { data, total, totalPages } = response.data;
            set({ clients: data, pagination: { page, total, totalPages }, isLoading: false, initialized: true });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err, 'Failed to fetch clients'), isLoading: false, initialized: true });
        }
    },

    fetchClientById: async (id: string) => {
        set({ isLoading: true, error: null, selectedClient: null });
        try {
            const response = await api.get<Client>(`/clients/${id}`);
            set({ selectedClient: response.data, isLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err, 'Failed to fetch client details'), isLoading: false });
        }
    },

    addClient: async (data: ClientFormData) => {
        try {
            await api.post<Client>('/clients', data);
            await get().fetchClients(1); // refresh first page — new client appears at top
        } catch (err: unknown) {
            set({ error: getErrorMessage(err, 'Failed to add client') });
            throw err;
        }
    },

    updateClient: async (id: string, data: ClientFormData) => {
        const prev = get().clients;
        const prevSelected = get().selectedClient;
        set({
            clients: prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
            selectedClient: prevSelected?.id === id ? { ...prevSelected, ...data } : prevSelected,
        });
        try {
            const response = await api.put<Client>(`/clients/${id}`, data);
            set({
                clients: get().clients.map((c) => (c.id === id ? response.data : c)),
                selectedClient: get().selectedClient?.id === id ? response.data : get().selectedClient,
            });
        } catch (err: unknown) {
            set({ clients: prev, selectedClient: prevSelected, error: getErrorMessage(err, 'Failed to update client') });
            throw err;
        }
    },

    deleteClient: async (id: string) => {
        const prev = get().clients;
        set({ clients: prev.filter((c) => c.id !== id), selectedClient: null });
        try {
            await api.delete(`/clients/${id}`);
            await get().fetchClients(get().pagination.page);
        } catch (err: unknown) {
            set({ clients: prev, error: getErrorMessage(err, 'Failed to delete client') });
            throw err;
        }
    },
}));
