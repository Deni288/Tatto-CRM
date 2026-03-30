export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export interface AdminArtist {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    subscriptionStatus: SubscriptionStatus;
    plan: string | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
}

export interface AdminStats {
    overview: {
        totalArtists: number;
        activeArtists: number;
        trialArtists: number;
        pastDueArtists: number;
        cancelledArtists: number;
    };
    mrr: {
        estimatedMonthly: number;
        currency: 'EUR';
    };
    trial: {
        endingSoon: Array<{
            id: string;
            name: string;
            email: string;
            trialEndsAt: string;
            daysRemaining: number;
        }>;
        expiredNotConverted: Array<{
            id: string;
            name: string;
            email: string;
            trialEndsAt: string;
            daysSinceExpiry: number;
        }>;
    };
    churnRisk: Array<{
        id: string;
        name: string;
        email: string;
        subscriptionStatus: SubscriptionStatus;
        currentPeriodEnd: string | null;
    }>;
    recentRegistrations: Array<{
        id: string;
        name: string;
        email: string;
        subscriptionStatus: SubscriptionStatus;
        trialEndsAt: string | null;
        createdAt: string;
    }>;
}
