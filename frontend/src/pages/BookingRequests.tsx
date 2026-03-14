import { useEffect, useState } from 'react';
import { Inbox, Loader2, CheckCircle, XCircle, Mail, Phone, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '../components/tremor/Card';
import { Button } from '../components/tremor/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingRequestStore } from '../store/bookingRequest.store';
import { gooeyToast } from 'goey-toast';

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PENDING:  { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Pending' },
    APPROVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Approved' },
    REJECTED: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400', label: 'Rejected' },
};

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const BookingRequests = () => {
    const { requests, isLoading, fetchRequests, updateRequestStatus } = useBookingRequestStore();
    const [filter, setFilter] = useState<StatusFilter>('ALL');

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);

    const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await updateRequestStatus(id, status);
            gooeyToast.success(`Request ${status.toLowerCase()} successfully`);
        } catch {
            gooeyToast.error('Failed to update request status');
        }
    };

    const filters: { label: string; value: StatusFilter }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Booking Requests</h1>
                    <p className="text-slate-400 mt-1 text-sm">Review and manage incoming booking requests</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                    {filters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                filter === f.value
                                    ? 'bg-gold-500 text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {f.label}
                            {f.value !== 'ALL' && (
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    {requests.filter(r => r.status === f.value).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {filtered.length > 0 ? (
                        <motion.div
                            key={filter}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {filtered.map((req, i) => {
                                const status = statusConfig[req.status] || statusConfig.PENDING;
                                return (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className="p-0 overflow-hidden hover:border-slate-700 transition-colors">
                                            <div className="p-5 sm:p-6">
                                                {/* Top row: Name + Status */}
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-gold-500 font-bold text-sm shrink-0">
                                                            {req.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white font-semibold text-base leading-tight">{req.name}</h3>
                                                            <p className="text-slate-500 text-xs mt-0.5">
                                                                {new Date(req.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.bg} ${status.text} border-current/10 shrink-0`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Contact info */}
                                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-400 mb-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail size={13} className="text-slate-500" />
                                                        {req.email}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone size={13} className="text-slate-500" />
                                                        {req.phone}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-slate-500" />
                                                        {req.preferredMonth}
                                                    </span>
                                                </div>

                                                {/* Tattoo idea */}
                                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 mb-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                                                        <Sparkles size={12} />
                                                        Tattoo Idea
                                                    </div>
                                                    <p className="text-slate-300 text-sm leading-relaxed">{req.tattooIdea}</p>
                                                </div>

                                                {/* Reference link */}
                                                {req.referenceLink && (
                                                    <a
                                                        href={req.referenceLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-gold-500 hover:text-gold-400 transition-colors mb-4"
                                                    >
                                                        <ExternalLink size={12} />
                                                        View Reference
                                                    </a>
                                                )}

                                                {/* Actions */}
                                                {req.status === 'PENDING' && (
                                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
                                                        <Button
                                                            onClick={() => handleStatusChange(req.id, 'APPROVED')}
                                                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 text-sm h-9 px-4"
                                                        >
                                                            <CheckCircle size={15} className="mr-1.5" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusChange(req.id, 'REJECTED')}
                                                            variant="secondary"
                                                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20 hover:border-rose-500/40 text-sm h-9 px-4"
                                                        >
                                                            <XCircle size={15} className="mr-1.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-5">
                                <Inbox size={28} className="text-slate-500" />
                            </div>
                            <h3 className="text-base font-medium text-slate-200 mb-1">No booking requests</h3>
                            <p className="text-slate-500 text-sm max-w-xs">
                                {filter === 'ALL'
                                    ? "No booking requests have been submitted yet."
                                    : `No ${filter.toLowerCase()} requests found.`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};
