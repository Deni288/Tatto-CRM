import { api } from './axiosInstance';

export interface BillingStatus {
    subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    isActive: boolean;
    hasCustomer: boolean;
}

export const getBillingStatus = async (): Promise<BillingStatus> => {
    const res = await api.get<BillingStatus>('/billing/status');
    return res.data;
};

export const createCheckoutSession = async (plan: 'monthly' | 'yearly'): Promise<string> => {
    const res = await api.post<{ url: string }>('/billing/checkout', { plan });
    return res.data.url;
};

export const createPortalSession = async (): Promise<string> => {
    const res = await api.post<{ url: string }>('/billing/portal');
    return res.data.url;
};
