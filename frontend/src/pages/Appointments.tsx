import { useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, MoreVertical } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { motion } from 'framer-motion';

const MOCK_APPOINTMENTS = [
    { id: '1', clientName: 'Sarah Connor', type: 'Full Sleeve Session 1', date: new Date(), duration: '4 hours', status: 'Scheduled' },
    { id: '2', clientName: 'John Doe', type: 'Chest Piece Consultation', date: addDays(new Date(), 1), duration: '1 hour', status: 'Scheduled' },
    { id: '3', clientName: 'Mike Tyson', type: 'Face Tattoo Touchup', date: addDays(new Date(), 2), duration: '2 hours', status: 'Pending Deposit' },
];

export const Appointments = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = MOCK_APPOINTMENTS.filter(appt =>
        appt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Appointments</h1>
                    <p className="text-slate-400 text-sm">Manage your schedule and bookings</p>
                </div>

                <button className="flex items-center justify-center px-4 py-2 bg-gold-500 hover:bg-gold-400 text-slate-950 font-medium rounded-lg transition-colors shadow-lg shadow-gold-500/20">
                    <Plus size={20} className="mr-2" />
                    New Booking
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
                        Today
                    </button>
                    <button className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium border-slate-700 transition-colors">
                        Upcoming
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {filtered.length > 0 ? (
                    <ul className="divide-y divide-slate-800">
                        {filtered.map((appt, i) => (
                            <motion.li
                                key={appt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-gold-500 shrink-0 shadow-inner">
                                        <span className="text-xs font-semibold uppercase">{format(appt.date, 'MMM')}</span>
                                        <span className="text-lg font-bold leading-none">{format(appt.date, 'd')}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium text-lg leading-snug group-hover:text-gold-500 transition-colors">
                                            {appt.type}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">with <span className="text-slate-300">{appt.clientName}</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex flex-col sm:items-end gap-1">
                                        <div className="flex items-center text-sm text-slate-300">
                                            <Clock size={14} className="mr-1.5 text-slate-500" />
                                            {format(appt.date, 'h:mm a')} ({appt.duration})
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${appt.status === 'Scheduled'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <CalendarIcon size={48} className="text-slate-700 mb-4" />
                        <p className="text-slate-400">No appointments found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};
