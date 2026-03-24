import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Loader2, ChevronLeft, Pencil } from 'lucide-react';
import { Card } from '../components/tremor/Card';
import { Input } from '../components/tremor/Input';
import { Button } from '../components/tremor/Button';
import { useClientStore, type Client } from '../store/client.store';
import { NewClientModal } from '../components/clients/NewClientModal';
import { EditClientModal } from '../components/clients/EditClientModal';

export const Clients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const navigate = useNavigate();
    
    const { clients, isLoading, initialized, fetchClients, pagination } = useClientStore();
    const { page, totalPages, total } = pagination;

    useEffect(() => {
        fetchClients(1);
    }, [fetchClients]);

    const filtered = clients.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Clients</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage your client database</p>
                </div>

                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none px-6"
                >
                    <Plus size={18} className="mr-2 -ml-1 shrink-0" />
                    New Client
                </Button>
            </div>

            <div className="relative">
                <Input
                    type="search"
                    placeholder="Search clients by name..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="max-w-md bg-slate-900/50 backdrop-blur-md"
                />
            </div>

            <Card className="p-0 sm:p-0 overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 shadow-xl min-h-[400px]">
                {(isLoading || !initialized) ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                    </div>
                ) : filtered.length > 0 ? (
                    <ul className="divide-y divide-slate-800">
                        {filtered.map((client) => (
                            <motion.li
                                key={client.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group flex items-center justify-between p-4 px-6 hover:bg-slate-800/40 cursor-pointer transition-all duration-200"
                                onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-gold-500 font-bold border border-slate-800 shadow-inner shrink-0">
                                        {client.firstName[0]}{client.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-slate-200 font-semibold group-hover:text-gold-500 transition-colors">
                                            {client.firstName} {client.lastName}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-0.5">{client.phone || client.email || 'No contact info'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingClient(client);
                                        }}
                                        className="p-2 rounded-lg text-slate-500 hover:text-gold-500 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Edit client"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <ChevronRight size={20} className="text-slate-600 group-hover:text-gold-500 transition-colors" />
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-200 mb-1">No clients found</h3>
                        <p className="text-slate-400 max-w-sm">
                            {searchTerm ? `No clients matching "${searchTerm}"` : "You haven't added any clients yet. Add your first client to get started."}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setIsModalOpen(true)} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white border-none">
                                Add Client
                            </Button>
                        )}
                    </div>
                )}
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-slate-400">
                        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} clients
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchClients(page - 1)}
                            disabled={page <= 1 || isLoading}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-slate-300 font-medium px-2">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => fetchClients(page + 1)}
                            disabled={page >= totalPages || isLoading}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            <NewClientModal open={isModalOpen} onOpenChange={setIsModalOpen} />
            {editingClient && (
                <EditClientModal
                    client={editingClient}
                    open={!!editingClient}
                    onOpenChange={(open) => { if (!open) setEditingClient(null); }}
                />
            )}
        </div>
    );
};
