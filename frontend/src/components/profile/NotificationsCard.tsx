import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const NotificationsCard = () => {
    const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

    if (!isSupported) {
        return (
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                <h2 className="text-sm font-semibold text-white mb-1">Push notifikacije</h2>
                <p className="text-sm text-slate-400">Tvoj browser ne podržava push notifikacije.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-white mb-1">Push notifikacije</h2>
                    <p className="text-sm text-slate-400">
                        {isSubscribed
                            ? 'Dobit ćeš obavijest kad stigne novi booking request.'
                            : 'Omogući obavijesti za nove booking requeste.'}
                    </p>
                    {permission === 'denied' && (
                        <p className="text-xs text-red-400 mt-2">
                            Notifikacije su blokirane u postavkama browsera. Omogući ih ručno i reload-aj stranicu.
                        </p>
                    )}
                </div>
                <div className="ml-4 shrink-0">
                    {isSubscribed ? (
                        <Bell className="w-5 h-5 text-green-400" />
                    ) : (
                        <BellOff className="w-5 h-5 text-slate-500" />
                    )}
                </div>
            </div>

            {permission !== 'denied' && (
                <button
                    onClick={() => void (isSubscribed ? unsubscribe() : subscribe())}
                    disabled={isLoading}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSubscribed
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            : 'bg-gold-500 text-slate-900 hover:bg-gold-400'
                    }`}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubscribed ? 'Isključi notifikacije' : 'Uključi notifikacije'}
                </button>
            )}
        </div>
    );
};
