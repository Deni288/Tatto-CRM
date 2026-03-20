import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Image, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/axiosInstance';

interface PortalAppointment {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    price: number | null;
    depositAmount: number | null;
    depositPaid: boolean;
}

interface PortalGalleryItem {
    id: string;
    imageUrl: string;
    description: string | null;
    createdAt: string;
}

interface PortalData {
    firstName: string;
    lastName: string;
    appointments: PortalAppointment[];
    gallery: PortalGalleryItem[];
}

const statusConfig = {
    SCHEDULED: { label: 'Zakazan', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    COMPLETED: { label: 'Završen', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    CANCELLED: { label: 'Otkazan', icon: XCircle, color: 'text-red-600 bg-red-50' },
    NO_SHOW: { label: 'Nije došao', icon: AlertCircle, color: 'text-gray-600 bg-gray-100' },
};

export const ClientPortal = () => {
    const { token } = useParams<{ token: string }>();
    const [data, setData] = useState<PortalData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!token) return;
        const load = async (): Promise<void> => {
            try {
                const res = await api.get<PortalData>(`/portal/${token}`);
                setData(res.data);
            } catch {
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [token]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Portal nije pronađen</h1>
                    <p className="text-gray-500 mt-2">Link je nevažeći ili je istekao.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Klijentski portal</p>
                    <h1 className="text-2xl font-bold text-gray-900">{data.firstName} {data.lastName}</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* Appointments */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Termini</h2>
                        <span className="text-sm text-gray-400">({data.appointments.length})</span>
                    </div>

                    {data.appointments.length === 0 ? (
                        <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-6">Nema termina.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.appointments.map((appt) => {
                                const cfg = statusConfig[appt.status];
                                const Icon = cfg.icon;
                                return (
                                    <div key={appt.id} className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{appt.title}</p>
                                                {appt.description && (
                                                    <p className="text-sm text-gray-500 mt-0.5">{appt.description}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(appt.startTime).toLocaleDateString('hr-HR', {
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        {appt.price !== null && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                                                <span>Cijena: <strong className="text-gray-800">€{Number(appt.price).toFixed(0)}</strong></span>
                                                {appt.depositAmount !== null && (
                                                    <span>Depozit: <strong className="text-gray-800">€{Number(appt.depositAmount).toFixed(0)}</strong> {appt.depositPaid ? '✓' : '(nije plaćen)'}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Gallery */}
                {data.gallery.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Image className="w-5 h-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Galerija radova</h2>
                            <span className="text-sm text-gray-400">({data.gallery.length})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {data.gallery.map((item) => (
                                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.description ?? 'Tattoo'}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {item.description && (
                                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
