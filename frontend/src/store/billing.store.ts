import { create } from 'zustand';
import { getBillingStatus, type BillingStatus } from '../api/billing.api';

interface BillingState {
    status: BillingStatus | null;
    isLoading: boolean;
    fetchStatus: () => Promise<void>;
    reset: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
    status: null,
    isLoading: false,

    fetchStatus: async (): Promise<void> => {
        set({ isLoading: true });
        try {
            const status = await getBillingStatus();
            set({ status, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    reset: (): void => set({ status: null, isLoading: false }),
}));
