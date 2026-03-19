import { create } from 'zustand';
import { api } from '../api/axiosInstance';
import type { ConsentFormData } from '@tattoocrm/shared';
import type { Client } from './client.store';

export type { ConsentFormData };

export interface ConsentForm {
    id: string;
    clientId: string;
    medicalConditions: string | null;
    allergies: string | null;
    agreedToTerms: boolean;
    signatureName: string;
    signatureImage?: string | null;
    createdAt: string;
    client?: Client;
}

interface ConsentState {
    consentForms: ConsentForm[];
    isLoading: boolean;
    error: string | null;
    fetchClientConsents: (clientId: string) => Promise<void>;
    createConsent: (clientId: string, data: ConsentFormData) => Promise<void>;
}

export const useConsentStore = create<ConsentState>()((set, get) => ({
    consentForms: [],
    isLoading: false,
    error: null,

    fetchClientConsents: async (clientId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/clients/${clientId}/consent-forms`);
            set({ consentForms: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to fetch consent forms', isLoading: false });
        }
    },

    createConsent: async (clientId: string, data: ConsentFormData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/clients/${clientId}/consent-forms`, data);
            get().fetchClientConsents(clientId);
        } catch (err: any) {
            set({ error: err.response?.data?.error || 'Failed to create consent form', isLoading: false });
            throw err;
        }
    }
}));
