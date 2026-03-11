import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Image as ImageIcon, FileText, Calendar, Plus, Loader2 } from 'lucide-react';
import { Card } from '../components/tremor/Card';
import { TabNavigation, TabNavigationLink } from '../components/tremor/TabNavigation';
import { Button } from '../components/tremor/Button';
import { useClientStore } from '../store/client.store';

export const ClientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'images' | 'appointments'>('info');

    const { selectedClient: client, isLoading, error, fetchClientById } = useClientStore();

    useEffect(() => {
        if (id) {
            fetchClientById(id);
        }
    }, [id, fetchClientById]);

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-gold-500" />
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="max-w-5xl mx-auto pb-12 text-center py-20">
                <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Client Not Found</h2>
                <p className="text-slate-400 mb-6">{error || "The client you are looking for doesn't exist or you don't have permission to view them."}</p>
                <Button onClick={() => navigate('/clients')} className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none">
                    Back to Clients
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button
                onClick={() => navigate('/clients')}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Clients
            </button>

            <Card className="p-0 overflow-hidden mb-6">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-gold-500 font-bold text-3xl shrink-0 border-2 border-slate-700">
                            {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{client.firstName} {client.lastName}</h1>
                            <div className="flex flex-col sm:flex-row sm:items-center text-slate-400 gap-2 sm:gap-6 text-sm">
                                <span>{client.email || 'No email'}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{client.phone || 'No phone'}</span>
                            </div>
                        </div>
                    </div>

                    <Button variant="secondary" className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                        <Edit3 size={18} className="mr-2" />
                        Edit Profile
                    </Button>
                </div>

                {/* Custom Tabs */}
                <div className="px-4 sm:px-8 border-b border-slate-800">
                    <TabNavigation className="gap-2">
                        {[
                            { id: 'info', label: 'Details & History', icon: FileText },
                            { id: 'images', label: 'Reference Images', icon: ImageIcon },
                            { id: 'appointments', label: 'Appointments', icon: Calendar },
                        ].map((tab) => (
                            <TabNavigationLink
                                key={tab.id}
                                active={activeTab === tab.id}
                                onClick={(e) => { e.preventDefault(); setActiveTab(tab.id as any); }}
                                href="#"
                                className="flex items-center py-4 px-2"
                            >
                                <tab.icon size={18} className="mr-2 shrink-0" />
                                {tab.label}
                            </TabNavigationLink>
                        ))}
                    </TabNavigation>
                </div>

                <div className="p-6 md:p-8">
                    {activeTab === 'info' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Tattoo History</h3>
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 text-slate-300">
                                    {client.tattooHistory || "No history provided."}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Custom Attributes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {client.customFields && Object.keys(client.customFields).length > 0 ? (
                                        Object.entries(client.customFields).map(([key, value]) => (
                                            <div key={key} className="bg-slate-950 p-4 rounded-lg border border-slate-800/50">
                                                <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-slate-200 font-medium">{String(value)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-slate-500 text-sm">No custom fields added yet.</p>
                                    )}
                                    <button className="border-2 border-dashed border-slate-800 rounded-lg p-4 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-gold-500 hover:border-gold-500/50 transition-colors col-span-1 md:col-span-2 mt-2">
                                        <Plus size={18} className="mr-2" /> Add Custom Field
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-12 text-slate-500">
                            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Image gallery coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-12 text-slate-500">
                            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Appointment history coming soon.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
