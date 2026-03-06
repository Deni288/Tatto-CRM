import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Image as ImageIcon, FileText, Calendar } from 'lucide-react';

const MOCK_CLIENT = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    tattooHistory: 'Has full left sleeve (Japanese traditional), chest piece.',
    customFields: {
        allergies: 'Latex',
        painTolerance: 'High',
        preferredMusic: 'Heavy Metal'
    }
};

export const ClientDetails = () => {
    useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'images' | 'appointments'>('info');

    // Load client by id here...
    const client = MOCK_CLIENT; // Using mock for now

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button
                onClick={() => navigate('/clients')}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Clients
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-gold-500 font-bold text-3xl shrink-0 border-2 border-slate-700">
                            {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{client.firstName} {client.lastName}</h1>
                            <div className="flex flex-col sm:flex-row sm:items-center text-slate-400 gap-2 sm:gap-6 text-sm">
                                <span>{client.email}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{client.phone}</span>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700">
                        <Edit3 size={18} className="mr-2" />
                        Edit Profile
                    </button>
                </div>

                {/* Custom Tabs */}
                <div className="flex px-4 sm:px-8 border-b border-slate-800 overflow-x-auto">
                    {[
                        { id: 'info', label: 'Details & History', icon: FileText },
                        { id: 'images', label: 'Reference Images', icon: ImageIcon },
                        { id: 'appointments', label: 'Appointments', icon: Calendar },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'border-gold-500 text-gold-500'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                                }`}
                        >
                            <tab.icon size={18} className="mr-2" />
                            {tab.label}
                        </button>
                    ))}
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
                                    {Object.entries(client.customFields).map(([key, value]) => (
                                        <div key={key} className="bg-slate-950 p-4 rounded-lg border border-slate-800/50">
                                            <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="text-slate-200 font-medium">{String(value)}</span>
                                        </div>
                                    ))}
                                    <button className="border-2 border-dashed border-slate-800 rounded-lg p-4 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-gold-500 hover:border-gold-500/50 transition-colors">
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
            </div>
        </div>
    );
};

// Extracted missing import for quick fix. (Lucide Plus needed in the custom fields block)
import { Plus } from 'lucide-react';
