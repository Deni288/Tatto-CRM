import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useClientStore } from '../../store/client.store';

export const GlobalSearch = () => {
    const navigate = useNavigate();
    const { clients, fetchClients } = useClientStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Ensure clients are loaded
    useEffect(() => {
        if (clients.length === 0) fetchClients();
    }, [clients.length, fetchClients]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = searchTerm.length > 1
        ? clients.filter(c => {
            const term = searchTerm.toLowerCase();
            return (
                c.firstName.toLowerCase().includes(term) ||
                c.lastName.toLowerCase().includes(term) ||
                (c.phone && c.phone.toLowerCase().includes(term)) ||
                (c.email && c.email.toLowerCase().includes(term))
            );
        }).slice(0, 8)
        : [];

    const handleSelect = (clientId: string) => {
        setSearchTerm('');
        setIsOpen(false);
        navigate(`/clients/${clientId}`);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                    onFocus={() => searchTerm.length > 1 && setIsOpen(true)}
                    placeholder="Search clients..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all"
                />
            </div>

            {/* Dropdown Results */}
            {isOpen && searchTerm.length > 1 && (
                <div className="absolute top-full mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden max-h-[320px] overflow-y-auto custom-scrollbar">
                    {filtered.length > 0 ? (
                        filtered.map((client) => (
                            <button
                                key={client.id}
                                onClick={() => handleSelect(client.id)}
                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-gold-500 shrink-0">
                                    {client.firstName[0]}{client.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {client.firstName} {client.lastName}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {client.phone || client.email || 'No contact info'}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <User size={20} className="mx-auto text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500">No clients found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
