import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, ChevronRight } from 'lucide-react';

// Mock data
const MOCK_CLIENTS = [
    { id: '1', firstName: 'John', lastName: 'Doe', phone: '+1 234 567 8900', lastAppt: '2026-02-15' },
    { id: '2', firstName: 'Sarah', lastName: 'Connor', phone: '+1 987 654 3210', lastAppt: '2026-03-01' },
    { id: '3', firstName: 'Mike', lastName: 'Tyson', phone: '+1 555 555 5555', lastAppt: '2025-11-20' },
];

export const Clients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const filtered = MOCK_CLIENTS.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clients</h1>
                    <p className="text-slate-400 text-sm">Manage your client database</p>
                </div>

                <button className="flex items-center justify-center px-4 py-2 bg-gold-500 hover:bg-gold-400 text-slate-950 font-medium rounded-lg transition-colors">
                    <Plus size={20} className="mr-2" />
                    New Client
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {filtered.length > 0 ? (
                    <ul className="divide-y divide-slate-800">
                        {filtered.map((client) => (
                            <motion.li
                                key={client.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group flex items-center justify-between p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/clients/${client.id}`)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gold-500 font-bold text-lg">
                                        {client.firstName[0]}{client.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium group-hover:text-gold-500 transition-colors">
                                            {client.firstName} {client.lastName}
                                        </h3>
                                        <p className="text-sm text-slate-400">{client.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-slate-500 space-x-4">
                                    <span className="hidden sm:inline-block">Last Appt: {client.lastAppt}</span>
                                    <ChevronRight size={20} className="text-slate-600 group-hover:text-gold-500 transition-colors" />
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        No clients found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};
