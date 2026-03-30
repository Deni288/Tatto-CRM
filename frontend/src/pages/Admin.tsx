import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../api/axiosInstance';
import { gooeyToast } from 'goey-toast';
import { AdminStatsOverview } from '../components/admin/AdminStatsOverview';
import { TrialTracker } from '../components/admin/TrialTracker';
import { ArtistManagementTable } from '../components/admin/ArtistManagementTable';
import type { AdminArtist, AdminStats } from '../types/admin.types';

export const Admin = () => {
    const [artists, setArtists] = useState<AdminArtist[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const [artistsRes, statsRes] = await Promise.all([
                    api.get<{ data: AdminArtist[] }>('/admin/artists'),
                    api.get<{ data: AdminStats }>('/admin/stats'),
                ]);
                setArtists(artistsRes.data.data);
                setStats(statsRes.data.data);
            } catch {
                gooeyToast.error('Failed to load admin data');
            } finally {
                setIsLoading(false);
            }
        };
        void fetchData();
    }, []);

    const handleToggle = async (artist: AdminArtist): Promise<void> => {
        setTogglingId(artist.id);
        const prev = artists;
        setArtists((curr) =>
            curr.map((a) => (a.id === artist.id ? { ...a, isActive: !a.isActive } : a))
        );
        try {
            await api.patch(`/admin/artists/${artist.id}/toggle`);
            gooeyToast.success(`${artist.name} ${artist.isActive ? 'deactivated' : 'activated'}`);
        } catch {
            setArtists(prev);
            gooeyToast.error('Failed to update artist status');
        } finally {
            setTogglingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gold-500 h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-gold-500 h-6 w-6" />
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <span className="text-slate-400 text-sm ml-2">{artists.length} artists</span>
            </div>

            {stats && (
                <>
                    <AdminStatsOverview overview={stats.overview} mrr={stats.mrr} />
                    <TrialTracker trial={stats.trial} />

                    {stats.churnRisk.length > 0 && (
                        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
                            <p className="text-sm font-semibold text-red-400 mb-3">
                                Churn Risk — Past Due ({stats.churnRisk.length})
                            </p>
                            <ul className="space-y-2">
                                {stats.churnRisk.map((u) => (
                                    <li key={u.id} className="flex items-center justify-between text-sm">
                                        <span className="text-white">{u.name}</span>
                                        <span className="text-slate-400">{u.email}</span>
                                        <span className="text-red-400 text-xs">
                                            Period ended {u.currentPeriodEnd
                                                ? new Date(u.currentPeriodEnd).toLocaleDateString()
                                                : '—'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            <div>
                <h2 className="text-lg font-semibold text-white mb-4">All Artists</h2>
                <ArtistManagementTable
                    artists={artists}
                    togglingId={togglingId}
                    onToggle={handleToggle}
                />
            </div>
        </div>
    );
};
