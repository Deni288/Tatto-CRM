import type { ReactElement } from 'react';
import { Users, CreditCard, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import type { AdminStats } from '../../types/admin.types';

interface Props {
    overview: AdminStats['overview'];
    mrr: AdminStats['mrr'];
}

interface StatCard {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

export function AdminStatsOverview({ overview, mrr }: Props): ReactElement {
    const cards: StatCard[] = [
        { label: 'Total Artists', value: String(overview.totalArtists), icon: Users, color: 'text-slate-400' },
        { label: 'Active (paying)', value: String(overview.activeArtists), icon: CreditCard, color: 'text-emerald-400' },
        { label: 'On Trial', value: String(overview.trialArtists), icon: Clock, color: 'text-blue-400' },
        { label: 'Past Due', value: String(overview.pastDueArtists), icon: AlertTriangle, color: 'text-red-400' },
        {
            label: 'Est. MRR',
            value: `€${mrr.estimatedMonthly}`,
            icon: TrendingUp,
            color: 'text-gold-400',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-2"
                >
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                        {card.label}
                    </div>
                    <span className={`text-2xl font-black ${card.color}`}>{card.value}</span>
                </div>
            ))}
        </div>
    );
}
