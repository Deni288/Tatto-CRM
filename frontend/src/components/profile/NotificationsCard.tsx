import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const NotificationsCard = () => {
    const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

    if (!isSupported) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Push notifikacije</h2>
                <p className="text-sm text-gray-500">Tvoj browser ne podržava push notifikacije.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Push notifikacije</h2>
                    <p className="text-sm text-gray-500">
                        {isSubscribed
                            ? 'Dobit ćeš obavijest kad stigne novi booking request.'
                            : 'Omogući obavijesti za nove booking requeste.'}
                    </p>
                    {permission === 'denied' && (
                        <p className="text-xs text-red-600 mt-2">
                            Notifikacije su blokirane u postavkama browsera. Omogući ih ručno i reload-aj stranicu.
                        </p>
                    )}
                </div>
                <div className="ml-4 shrink-0">
                    {isSubscribed ? (
                        <Bell className="w-5 h-5 text-green-500" />
                    ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {permission !== 'denied' && (
                <button
                    onClick={() => void (isSubscribed ? unsubscribe() : subscribe())}
                    disabled={isLoading}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSubscribed
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubscribed ? 'Isključi notifikacije' : 'Uključi notifikacije'}
                </button>
            )}
        </div>
    );
};
