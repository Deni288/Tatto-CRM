import type { ReactElement } from 'react';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import type { AdminArtist } from '../../types/admin.types';

interface Props {
    artists: AdminArtist[];
    togglingId: string | null;
    onToggle: (artist: AdminArtist) => void;
}

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-400',
    TRIAL: 'bg-blue-500/20 text-blue-400',
    PAST_DUE: 'bg-red-500/20 text-red-400',
    CANCELLED: 'bg-slate-700 text-slate-400',
    EXPIRED: 'bg-slate-700 text-slate-400',
};

const formatDate = (iso: string | null): string => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
};

const trialLabel = (artist: AdminArtist): string => {
    if (artist.subscriptionStatus === 'TRIAL' && artist.trialEndsAt) {
        return `Trial ends ${formatDate(artist.trialEndsAt)}`;
    }
    if (artist.currentPeriodEnd) {
        return `Renews ${formatDate(artist.currentPeriodEnd)}`;
    }
    return '—';
};

export function ArtistManagementTable({ artists, togglingId, onToggle }: Props): ReactElement {
    return (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-800/60">
                    <tr>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium">Artist</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Email</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Subscription</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Billing</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Joined</th>
                        <th className="text-right px-4 py-3 text-slate-400 font-medium">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {artists.map((artist) => (
                        <tr key={artist.id} className="bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{artist.name}</td>
                            <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{artist.email}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[artist.subscriptionStatus] ?? 'bg-slate-700 text-slate-400'}`}>
                                    {artist.subscriptionStatus}
                                    {artist.plan ? ` · ${artist.plan}` : ''}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                                {trialLabel(artist)}
                            </td>
                            <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                                {new Date(artist.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => onToggle(artist)}
                                    disabled={togglingId === artist.id}
                                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {togglingId === artist.id ? (
                                        <Loader2 className="animate-spin h-4 w-4" />
                                    ) : artist.isActive ? (
                                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                                    ) : (
                                        <ToggleLeft className="h-5 w-5 text-slate-500" />
                                    )}
                                    {artist.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {artists.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                No artists registered yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
