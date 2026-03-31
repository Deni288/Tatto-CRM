import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useBillingStore } from '../store/billing.store';
import { createCheckoutSession, createPortalSession } from '../api/billing.api';
import { gooeyToast } from 'goey-toast';

const MONTHLY_PRICE = 22;
const YEARLY_PRICE = 220;
const YEARLY_MONTHLY_EQUIVALENT = Math.round(YEARLY_PRICE / 12);

export const Billing = () => {
    const { status, fetchStatus, isLoading } = useBillingStore();
    const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'yearly' | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        void fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            gooeyToast.success('Subscription activated! Thank you.');
            void fetchStatus();
        }
    }, [searchParams, fetchStatus]);

    const handleCheckout = async (plan: 'monthly' | 'yearly'): Promise<void> => {
        setCheckoutLoading(plan);
        try {
            const url = await createCheckoutSession(plan);
            window.location.href = url;
        } catch {
            gooeyToast.error('Failed to open Stripe checkout.');
            setCheckoutLoading(null);
        }
    };

    const handlePortal = async (): Promise<void> => {
        setPortalLoading(true);
        try {
            const url = await createPortalSession();
            window.open(url, '_blank');
        } catch {
            gooeyToast.error('Failed to open billing portal.');
        } finally {
            setPortalLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Billing</h1>
                <p className="text-slate-400 mt-1">Manage your subscription</p>
            </div>

            {/* Trenutni status */}
            {status && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Current plan</h2>
                    <StatusBadge status={status.subscriptionStatus} trialEndsAt={status.trialEndsAt} currentPeriodEnd={status.currentPeriodEnd} />

                    {status.hasCustomer && (
                        <button
                            onClick={() => void handlePortal()}
                            disabled={portalLoading}
                            className="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white underline"
                        >
                            {portalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Manage subscription (Stripe Portal)
                        </button>
                    )}
                </div>
            )}

            {/* Pricing cards — prikaži samo ako nije ACTIVE */}
            {status?.subscriptionStatus !== 'ACTIVE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PricingCard
                        title="Monthly"
                        price={MONTHLY_PRICE}
                        period="/ mo"
                        note={null}
                        loading={checkoutLoading === 'monthly'}
                        onSelect={() => void handleCheckout('monthly')}
                    />
                    <PricingCard
                        title="Yearly"
                        price={YEARLY_MONTHLY_EQUIVALENT}
                        period="/ mo"
                        note={`€${YEARLY_PRICE} billed yearly · Save 2 months`}
                        loading={checkoutLoading === 'yearly'}
                        onSelect={() => void handleCheckout('yearly')}
                        highlighted
                    />
                </div>
            )}
        </div>
    );
};

const features = [
    'Unlimited clients',
    'Appointment calendar',
    'Booking links',
    'Work gallery',
    'Consent forms',
    'Email notifications',
];

interface PricingCardProps {
    title: string;
    price: number;
    period: string;
    note: string | null;
    loading: boolean;
    onSelect: () => void;
    highlighted?: boolean;
}

const PricingCard = ({ title, price, period, note, loading, onSelect, highlighted = false }: PricingCardProps) => (
    <div className={`rounded-xl border-2 p-6 flex flex-col gap-6 bg-slate-900/50 ${highlighted ? 'border-gold-500' : 'border-slate-700'}`}>
        {highlighted && (
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Recommended</span>
        )}
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">€{price}</span>
                <span className="text-slate-400">{period}</span>
            </div>
            {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
        </div>

        <ul className="space-y-2 flex-1">
            {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                highlighted
                    ? 'bg-gold-500 text-slate-900 hover:bg-gold-400'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Select plan
        </button>
    </div>
);

interface StatusBadgeProps {
    status: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
}

const StatusBadge = ({ status, trialEndsAt, currentPeriodEnd }: StatusBadgeProps) => {
    const labels: Record<string, { label: string; color: string }> = {
        TRIAL: { label: 'Trial', color: 'bg-blue-900/40 text-blue-400' },
        ACTIVE: { label: 'Active', color: 'bg-green-900/40 text-green-400' },
        PAST_DUE: { label: 'Payment failed', color: 'bg-red-900/40 text-red-400' },
        CANCELLED: { label: 'Cancelled', color: 'bg-slate-800 text-slate-400' },
        EXPIRED: { label: 'Expired', color: 'bg-red-900/40 text-red-400' },
    };

    const { label, color } = labels[status] ?? { label: status, color: 'bg-slate-800 text-slate-400' };
    const dateStr = status === 'TRIAL' ? trialEndsAt : currentPeriodEnd;

    return (
        <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{label}</span>
            {dateStr && (
                <span className="text-sm text-slate-400">
                    {status === 'TRIAL' ? 'Expires' : 'Next billing'}:{' '}
                    {new Date(dateStr).toLocaleDateString('en-GB')}
                </span>
            )}
        </div>
    );
};
