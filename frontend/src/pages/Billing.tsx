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
            gooeyToast.success('Pretplata aktivirana! Hvala ti.');
            void fetchStatus();
        }
    }, [searchParams, fetchStatus]);

    const handleCheckout = async (plan: 'monthly' | 'yearly'): Promise<void> => {
        setCheckoutLoading(plan);
        try {
            const url = await createCheckoutSession(plan);
            window.location.href = url;
        } catch {
            gooeyToast.error('Greška pri otvaranju Stripe checkoutа.');
            setCheckoutLoading(null);
        }
    };

    const handlePortal = async (): Promise<void> => {
        setPortalLoading(true);
        try {
            const url = await createPortalSession();
            window.open(url, '_blank');
        } catch {
            gooeyToast.error('Greška pri otvaranju billing portala.');
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
                <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
                <p className="text-gray-500 mt-1">Upravljaj svojom pretplatom</p>
            </div>

            {/* Trenutni status */}
            {status && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Trenutni plan</h2>
                    <StatusBadge status={status.subscriptionStatus} trialEndsAt={status.trialEndsAt} currentPeriodEnd={status.currentPeriodEnd} />

                    {status.hasCustomer && (
                        <button
                            onClick={() => void handlePortal()}
                            disabled={portalLoading}
                            className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            {portalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Upravljaj pretplatom (Stripe Portal)
                        </button>
                    )}
                </div>
            )}

            {/* Pricing cards — prikaži samo ako nije ACTIVE */}
            {status?.subscriptionStatus !== 'ACTIVE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PricingCard
                        title="Mjesečno"
                        price={MONTHLY_PRICE}
                        period="/ mj"
                        note={null}
                        loading={checkoutLoading === 'monthly'}
                        onSelect={() => void handleCheckout('monthly')}
                    />
                    <PricingCard
                        title="Godišnje"
                        price={YEARLY_MONTHLY_EQUIVALENT}
                        period="/ mj"
                        note={`€${YEARLY_PRICE} naplaćeno godišnje · Uštedi 2 mjeseca`}
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
    'Neograničeni klijenti',
    'Kalendar termina',
    'Booking linkovi',
    'Galerija radova',
    'Consent forme',
    'Email notifikacije',
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
    <div className={`rounded-xl border-2 p-6 flex flex-col gap-6 ${highlighted ? 'border-black' : 'border-gray-200'}`}>
        {highlighted && (
            <span className="text-xs font-bold uppercase tracking-widest text-black">Preporučeno</span>
        )}
        <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">€{price}</span>
                <span className="text-gray-500">{period}</span>
            </div>
            {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
        </div>

        <ul className="space-y-2 flex-1">
            {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                highlighted
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Odaberi plan
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
        TRIAL: { label: 'Trial', color: 'bg-blue-100 text-blue-800' },
        ACTIVE: { label: 'Aktivno', color: 'bg-green-100 text-green-800' },
        PAST_DUE: { label: 'Plaćanje nije prošlo', color: 'bg-red-100 text-red-800' },
        CANCELLED: { label: 'Otkazano', color: 'bg-gray-100 text-gray-600' },
        EXPIRED: { label: 'Isteklo', color: 'bg-red-100 text-red-800' },
    };

    const { label, color } = labels[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
    const dateStr = status === 'TRIAL' ? trialEndsAt : currentPeriodEnd;

    return (
        <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{label}</span>
            {dateStr && (
                <span className="text-sm text-gray-500">
                    {status === 'TRIAL' ? 'Ističe' : 'Sljedeća naplata'}:{' '}
                    {new Date(dateStr).toLocaleDateString('hr-HR')}
                </span>
            )}
        </div>
    );
};
