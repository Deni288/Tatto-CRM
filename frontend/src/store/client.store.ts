import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { ClientFormData } from '../schemas/client.schema';
import type { Appointment } from './appointment.store';

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    tattooHistory?: string | null;
    customFields?: Record<string, unknown> | null;
    createdAt: string;
    appointments?: Appointment[];
}

interface ClientState {
    clients: Client[];
    selectedClient: Client | null;
    isLoading: boolean;
    error: string | null;
    fetchClients: () => Promise<void>;
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

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    selectedClient: null,
    isLoading: false,
    error: null,

    fetchClients: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<Client[]>('/clients');
            set({ clients: response.data, isLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err, 'Failed to fetch clients'), isLoading: false });
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
            const response = await api.post<Client>('/clients', data);
            set({ clients: [response.data, ...get().clients] });
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
        } catch (err: unknown) {
            set({ clients: prev, error: getErrorMessage(err, 'Failed to delete client') });
            throw err;
        }
    },
}));
