import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { ClientFormData } from '../schemas/client.schema';

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    tattooHistory: string | null;
    customFields: Record<string, any> | null;
    createdAt: string;
}

interface ClientState {
    clients: Client[];
    selectedClient: Client | null;
    isLoading: boolean;
    error: string | null;
    fetchClients: () => Promise<void>;
    fetchClientById: (id: string) => Promise<void>;
    addClient: (data: ClientFormData) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    selectedClient: null,
    isLoading: false,
    error: null,

    fetchClients: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/clients');
            set({ clients: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch clients', isLoading: false });
        }
    },

    fetchClientById: async (id: string) => {
        set({ isLoading: true, error: null, selectedClient: null });
        try {
            const response = await api.get(`/clients/${id}`);
            set({ selectedClient: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch client details', isLoading: false });
        }
    },

    addClient: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/clients', data);
            set({ clients: [response.data, ...get().clients], isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to add client', isLoading: false });
            throw err;
        }
    }
}));
