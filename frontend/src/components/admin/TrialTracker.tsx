import type { ReactElement } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import type { AdminStats } from '../../types/admin.types';

interface Props {
    trial: AdminStats['trial'];
}

export function TrialTracker({ trial }: Props): ReactElement {
    const { endingSoon, expiredNotConverted } = trial;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ending soon */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-amber-500/5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">Trial Ending Soon</span>
                    <span className="ml-auto text-xs text-slate-500">{endingSoon.length} users</span>
                </div>
                {endingSoon.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500 text-center">No trials ending in the next 7 days</p>
                ) : (
                    <ul className="divide-y divide-slate-800">
                        {endingSoon.map((u) => (
                            <li key={u.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-white">{u.name}</p>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/15 text-amber-400">
                                    {u.daysRemaining}d left
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Expired not converted */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-red-500/5">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">Expired — Not Converted</span>
                    <span className="ml-auto text-xs text-slate-500">{expiredNotConverted.length} users</span>
                </div>
                {expiredNotConverted.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500 text-center">No expired trials</p>
                ) : (
                    <ul className="divide-y divide-slate-800">
                        {expiredNotConverted.map((u) => (
                            <li key={u.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-white">{u.name}</p>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/15 text-red-400">
                                    {u.daysSinceExpiry}d ago
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
