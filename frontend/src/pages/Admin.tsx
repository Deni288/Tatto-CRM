import { useState, useEffect } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { api } from '../api/axiosInstance';
import { gooeyToast } from 'goey-toast';

interface Artist {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export const Admin = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchArtists = async (): Promise<void> => {
            try {
                const res = await api.get<{ data: Artist[] }>('/admin/artists');
                setArtists(res.data.data);
            } catch {
                gooeyToast.error('Failed to load artists');
            } finally {
                setIsLoading(false);
            }
        };
        void fetchArtists();
    }, []);

    const handleToggle = async (artist: Artist): Promise<void> => {
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
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-gold-500 h-6 w-6" />
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <span className="text-slate-400 text-sm ml-2">{artists.length} artists</span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                        <tr>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Artist</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Joined</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                            <th className="text-right px-4 py-3 text-slate-400 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {artists.map((artist) => (
                            <tr key={artist.id} className="bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-3 text-white font-medium">{artist.name}</td>
                                <td className="px-4 py-3 text-slate-300">{artist.email}</td>
                                <td className="px-4 py-3 text-slate-400">
                                    {new Date(artist.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        artist.isActive
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {artist.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => void handleToggle(artist)}
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
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                    No artists registered yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
