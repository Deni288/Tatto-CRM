import { Card } from '../components/tremor/Card';
import { Button } from '../components/tremor/Button';
import { Badge } from '../components/tremor/Badge';
import { Plus, Calendar, Clock, Users, DollarSign, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import { useClientStore } from '../store/client.store';
import { useEffect, useState } from 'react';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { clients, fetchClients } = useClientStore();
    const [appointments] = useState<any[]>([]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const stats = [
        { name: "Today's Revenue", value: "$0.00", icon: DollarSign, trend: "0%" },
        { name: 'Upcoming Appts', value: appointments.length.toString(), icon: Calendar, trend: "No upcoming appointments" },
        { name: 'Total Clients', value: clients.length.toString(), icon: Users, trend: "Registered clients" },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome back, Ink Master</h1>
                    <p className="text-sm md:text-base text-slate-400 mt-1">Here is what's happening in your studio today.</p>
                </div>
                {/* Desktop Buttons - Hidden on Mobile, moved to Quick Actions */}
                <div className="hidden sm:flex gap-3">
                    <Button onClick={() => navigate('/appointments')} className="bg-slate-800 hover:bg-slate-700 text-white border-transparent shadow-lg hover:shadow-xl transition-all h-10">
                        <Calendar size={18} className="mr-2 hidden lg:block" />
                        View Calendar
                    </Button>
                    <Button onClick={() => navigate('/appointments')} className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-transparent shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all font-semibold h-10">
                        <Plus size={18} className="mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6 md:space-y-8"
            >
                {/* Stats Grid - Mobile First: 1 col -> 2 cols -> 3 cols */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div key={idx} variants={itemVariants}>
                            <Card className="p-5 md:p-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition-colors shadow-lg shadow-black/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-slate-400">{stat.name}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5">{stat.value}</p>
                                    </div>
                                    <div className="p-2.5 sm:p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                                        <stat.icon size={20} className="text-gold-500 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">{stat.trend}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Appointments - Takes 2 cols on Desktop */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="p-0 overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-xl flex flex-col h-full">
                            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                                <h2 className="text-base md:text-lg font-bold text-white flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-gold-500 hidden sm:block" />
                                    Today's Appointments
                                </h2>
                                <Button variant="secondary" onClick={() => navigate('/appointments')} className="text-xs h-8 px-3">
                                    View All
                                </Button>
                            </div>

                            {/* Mobile-optimized List/Cards */}
                            <div className="flex-1 overflow-hidden">
                                <ul className="divide-y divide-slate-800/50">
                                    {appointments.map((appt) => (
                                        <li
                                            key={appt.id}
                                            className="p-4 md:p-6 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer active:bg-slate-800/60"
                                            onClick={() => navigate('/appointments')}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-sm md:text-base text-gold-500 font-bold shadow-inner">
                                                    {appt.clientName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm md:text-base text-white font-medium truncate group-hover:text-gold-500 transition-colors">
                                                        {appt.clientName}
                                                        <span className="sm:hidden text-slate-400 font-normal ml-2 text-xs">— {appt.time}</span>
                                                    </p>
                                                    <p className="text-xs md:text-sm text-slate-400 mt-0.5 md:mt-1 truncate">{appt.type}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-13 sm:pl-0">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm text-slate-300 flex items-center gap-1.5">
                                                        <Clock size={14} className="text-slate-500" />
                                                        {appt.time}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={appt.status === 'In Progress' ? 'success' : 'neutral'}
                                                    className="text-[10px] md:text-xs tracking-wide py-0.5 px-2"
                                                >
                                                    {appt.status}
                                                </Badge>
                                                <ChevronRight className="w-4 h-4 text-slate-600 sm:hidden" />
                                            </div>
                                        </li>
                                    ))}
                                    {appointments.length === 0 && (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            No appointments scheduled for today.
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Quick Actions - Mobile Friendly Vertical Stack */}
                    <motion.div variants={itemVariants}>
                        <Card className="p-4 md:p-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-xl h-full">
                            <h2 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6">Quick Actions</h2>
                            <div className="flex flex-col gap-3">
                                {/* Mobile-only New Booking Button */}
                                <Button
                                    onClick={() => navigate('/appointments')}
                                    className="sm:hidden w-full justify-center py-5 bg-gold-500 text-slate-900 border-none shadow-[0_0_15px_rgba(212,175,55,0.2)] font-bold rounded-xl active:scale-[0.98] transition-transform"
                                >
                                    <Plus size={20} className="mr-2" />
                                    New Booking
                                </Button>

                                <Button
                                    onClick={() => navigate('/clients')}
                                    variant="secondary"
                                    className="w-full justify-start py-4 bg-slate-950/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all font-medium rounded-xl active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mr-3 border border-slate-800/50">
                                        <Users size={16} className="text-gold-500" />
                                    </div>
                                    <span className="text-sm">Manage Clients</span>
                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />
                                </Button>

                                <Button
                                    onClick={() => navigate('/consent')}
                                    variant="secondary"
                                    className="w-full justify-start py-4 bg-slate-950/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all font-medium rounded-xl active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mr-3 border border-slate-800/50">
                                        <Plus size={16} className="text-gold-500" />
                                    </div>
                                    <span className="text-sm">New Consent Form</span>
                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />
                                </Button>

                                <Button
                                    onClick={() => navigate('/appointments')}
                                    variant="secondary"
                                    className="w-full justify-start py-4 bg-slate-950/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all font-medium rounded-xl active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mr-3 border border-slate-800/50">
                                        <Calendar size={16} className="text-gold-500" />
                                    </div>
                                    <span className="text-sm">View Full Schedule</span>
                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
