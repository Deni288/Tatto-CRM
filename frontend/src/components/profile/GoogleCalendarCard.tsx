import { useState, useEffect, type ReactElement } from 'react';
import { Calendar, Loader2, Unplug } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { Card } from '../tremor/Card';
import { api } from '../../api/axiosInstance';

interface CalendarStatus {
    connected: boolean;
    calendarId: string | null;
    connectedAt: string | null;
}

export function GoogleCalendarCard(): ReactElement {
    const [status, setStatus] = useState<CalendarStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gcal = params.get('gcal');
        if (gcal === 'connected') {
            gooeyToast.success('Google Calendar connected!');
            window.history.replaceState({}, '', window.location.pathname);
        } else if (gcal === 'error') {
            gooeyToast.error('Failed to connect Google Calendar');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    useEffect(() => {
        api.get<CalendarStatus>('/google-calendar/status')
            .then((res) => setStatus(res.data))
            .catch(() => setStatus({ connected: false, calendarId: null, connectedAt: null }))
            .finally(() => setIsLoading(false));
    }, []);

    const handleConnect = async (): Promise<void> => {
        try {
            const res = await api.get<{ url: string }>('/google-calendar/connect');
            window.location.href = res.data.url;
        } catch {
            gooeyToast.error('Failed to initiate connection');
        }
    };

    const handleDisconnect = async (): Promise<void> => {
        setIsDisconnecting(true);
        try {
            await api.delete('/google-calendar/disconnect');
            setStatus({ connected: false, calendarId: null, connectedAt: null });
            gooeyToast.success('Google Calendar disconnected');
        } catch {
            gooeyToast.error('Failed to disconnect');
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <Card className="p-6 bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-gold-500" />
                <h2 className="text-base font-semibold text-white">Google Calendar</h2>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Loading...</span>
                </div>
            ) : status?.connected ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-300">Connected</span>
                        {status.connectedAt && (
                            <span className="text-xs text-slate-500">
                                since {new Date(status.connectedAt).toLocaleDateString('en-GB')}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400">
                        New appointments are automatically synced to your Google Calendar.
                    </p>
                    <button
                        onClick={() => { void handleDisconnect(); }}
                        disabled={isDisconnecting}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                        {isDisconnecting ? <Loader2 size={14} className="animate-spin" /> : <Unplug size={14} />}
                        Disconnect calendar
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-slate-400">
                        Connect Google Calendar to automatically sync your appointments.
                    </p>
                    <button
                        onClick={() => { void handleConnect(); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold rounded-xl transition-all duration-200"
                    >
                        <Calendar size={16} />
                        Connect Google Calendar
                    </button>
                </div>
            )}
        </Card>
    );
}
