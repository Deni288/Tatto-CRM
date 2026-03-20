import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const API_URL = import.meta.env.VITE_API_URL as string || 'http://localhost:5000/api';

const downloadCSV = async (endpoint: string, filename: string, token: string | null): Promise<void> => {
    const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export const ExportCard = () => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState<'clients' | 'appointments' | null>(null);

    const handleExport = async (type: 'clients' | 'appointments'): Promise<void> => {
        setLoading(type);
        try {
            const filename = `${type === 'clients' ? 'klijenti' : 'termini'}-${new Date().toISOString().slice(0, 10)}.csv`;
            await downloadCSV(`export/${type}`, filename, token);
        } catch {
            // gooeyToast not imported here to keep component small
            alert('Export nije uspio. Pokušaj ponovo.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Export podataka</h2>
            <p className="text-sm text-slate-400 mb-4">Preuzmi sve klijente ili termine kao CSV datoteku.</p>
            <div className="flex gap-3">
                <button
                    onClick={() => void handleExport('clients')}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    {loading === 'clients' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Klijenti
                </button>
                <button
                    onClick={() => void handleExport('appointments')}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {loading === 'appointments' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Termini
                </button>
            </div>
        </div>
    );
};
