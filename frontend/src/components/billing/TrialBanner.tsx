import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBillingStore } from '../../store/billing.store';
import { useAuthStore } from '../../store/auth.store';

const getDaysLeft = (trialEndsAt: string): number => {
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const TrialBanner = () => {
    const { status, fetchStatus } = useBillingStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) void fetchStatus();
    }, [user, fetchStatus]);

    if (!status || status.subscriptionStatus !== 'TRIAL' || !status.trialEndsAt) return null;

    const daysLeft = getDaysLeft(status.trialEndsAt);
    if (daysLeft > 7) return null; // Ne prikazuj ako ima više od 7 dana

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm">
            <span className="text-amber-800">
                {daysLeft === 0
                    ? 'Trial istječe danas!'
                    : `Trial ističe za ${daysLeft} ${daysLeft === 1 ? 'dan' : 'dana'}.`}
            </span>
            {' '}
            <button
                onClick={() => navigate('/dashboard/billing')}
                className="text-amber-900 font-semibold underline hover:no-underline"
            >
                Aktiviraj pretplatu
            </button>
        </div>
    );
};
