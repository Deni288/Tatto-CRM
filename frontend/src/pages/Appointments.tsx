import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MoreVertical, Loader2, CheckCircle, XCircle, Trash2, Edit2, MessageCircle, User, Heart } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Card } from '../components/tremor/Card';
import { Input } from '../components/tremor/Input';
import { Button } from '../components/tremor/Button';
import { format, isSameDay, startOfToday } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppointmentStore, type Appointment } from '../store/appointment.store';
import { NewBookingModal } from '../components/appointments/NewBookingModal';
import { EditBookingModal } from '../components/appointments/EditBookingModal';
import { gooeyToast } from 'goey-toast';

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    SCHEDULED: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Scheduled' },
    COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Completed' },
    CANCELLED: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400', label: 'Cancelled' },
    NO_SHOW:   { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400', label: 'No Show' },
};

export const Appointments = () => {
    const { appointments, isLoading, fetchAppointments, updateStatus, deleteAppointment } = useAppointmentStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Dates that have appointments (for calendar dot indicators)
    const appointmentDates = useMemo(() => {
        return appointments.map(a => new Date(a.startTime));
    }, [appointments]);

    // Filter by selected date + search term
    const filtered = useMemo(() => {
        return appointments.filter(appt => {
            const matchesDate = isSameDay(new Date(appt.startTime), selectedDate);
            if (!matchesDate) return false;

            if (searchTerm) {
                const clientName = appt.client ? `${appt.client.firstName} ${appt.client.lastName}` : 'Unknown Client';
                return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       appt.title.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });
    }, [appointments, selectedDate, searchTerm]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateStatus(id, status);
            gooeyToast.success(`Appointment marked as ${status.toLowerCase()}`);
        } catch (error) {
            gooeyToast.error('Failed to change status');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            try {
                await deleteAppointment(id);
                gooeyToast.success('Appointment deleted successfully');
            } catch (error) {
                gooeyToast.error('Failed to delete appointment');
            }
        }
    };

    const handleWhatsAppReminder = (appt: Appointment) => {
        const client = appt.client;
        if (!client?.phone) {
            gooeyToast.error('This client has no phone number on file.');
            return;
        }

        const cleanPhone = client.phone.replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            gooeyToast.error('Client phone number is invalid.');
            return;
        }

        const clientName = `${client.firstName} ${client.lastName}`;
        const dateStr = format(new Date(appt.startTime), "dd.MM.yyyy 'u' HH:mm");
        const text = `Bok ${clientName}, samo mali podsjetnik za tvoj termin za tetoviranje (${appt.title}) koji je zakazan za ${dateStr}. Vidimo se! 🖤`;

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleWhatsAppAftercare = (appt: Appointment) => {
        const client = appt.client;
        if (!client?.phone) {
            gooeyToast.error('This client has no phone number on file.');
            return;
        }

        const cleanPhone = client.phone.replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            gooeyToast.error('Client phone number is invalid.');
            return;
        }

        const aftercareText = 'Hvala na povjerenju! Evo uputa za njegu tetovaže: 1. Foliju drži 3 sata... 2. Peri blagim sapunom...';
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(aftercareText)}`, '_blank');
    };

    // Check if a day has appointments for dot indicators
    const hasAppointment = (day: Date) => appointmentDates.some(d => isSameDay(d, day));

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Appointments</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage your schedule and bookings</p>
                </div>
                <Button 
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none px-6 font-semibold"
                >
                    <Plus size={18} className="mr-1.5 -ml-1 shrink-0" />
                    New Booking
                </Button>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                
                {/* LEFT COLUMN — Calendar */}
                <div className="space-y-4">
                    <Card className="p-4 overflow-hidden">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(day) => day && setSelectedDate(day)}
                            modifiers={{ hasAppointment }}
                            modifiersClassNames={{ hasAppointment: 'rdp-day--has-appt' }}
                            classNames={{
                                months: 'flex flex-col',
                                month: 'space-y-3',
                                caption: 'flex justify-center pt-1 relative items-center',
                                caption_label: 'text-sm font-semibold text-white',
                                nav: 'flex items-center gap-1',
                                nav_button: 'h-7 w-7 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors',
                                nav_button_previous: 'absolute left-1',
                                nav_button_next: 'absolute right-1',
                                table: 'w-full border-collapse',
                                head_row: 'flex',
                                head_cell: 'text-slate-500 rounded-md w-9 font-medium text-[0.7rem] uppercase tracking-wider',
                                row: 'flex w-full mt-1',
                                cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20 h-9 w-9',
                                day: 'h-9 w-9 p-0 font-normal text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm flex items-center justify-center',
                                day_selected: '!bg-gold-500 !text-slate-900 font-semibold hover:!bg-gold-400',
                                day_today: 'ring-1 ring-gold-500/50 text-gold-400 font-semibold',
                                day_outside: 'text-slate-700 opacity-50',
                                day_disabled: 'text-slate-800',
                            }}
                        />
                    </Card>

                    {/* Quick stats */}
                    <Card className="p-4 space-y-3">
                        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            {format(selectedDate, 'EEEE, MMM d')}
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Appointments</span>
                            <span className="text-lg font-bold text-white">{filtered.length}</span>
                        </div>
                        <div className="h-px bg-slate-800" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Total (all dates)</span>
                            <span className="text-sm font-medium text-slate-300">{appointments.length}</span>
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN — Appointment list */}
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Input
                            type="search"
                            placeholder="Search by client or title..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Day label */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                            {isSameDay(selectedDate, startOfToday()) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
                        </h2>
                        {!isSameDay(selectedDate, startOfToday()) && (
                            <button 
                                onClick={() => setSelectedDate(startOfToday())}
                                className="text-xs text-gold-500 hover:text-gold-400 transition-colors font-medium"
                            >
                                Jump to Today
                            </button>
                        )}
                    </div>

                    {/* Cards */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {filtered.length > 0 ? (
                                <motion.div
                                    key={selectedDate.toISOString()}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3"
                                >
                                    {filtered.map((appt, i) => {
                                        const clientName = appt.client ? `${appt.client.firstName} ${appt.client.lastName}` : 'Unknown';
                                        const status = statusConfig[appt.status] || statusConfig.SCHEDULED;
                                        return (
                                            <motion.div
                                                key={appt.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                            >
                                                <Card className="p-0 overflow-hidden group hover:scale-[1.01] transition-transform duration-200 hover:border-slate-700">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                                                        {/* Left: Info */}
                                                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex flex-col items-center justify-center text-gold-500 shrink-0">
                                                                <Clock size={14} className="mb-0.5 opacity-60" />
                                                                <span className="text-xs font-bold leading-none">
                                                                    {format(new Date(appt.startTime), 'HH:mm')}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-white font-semibold text-base leading-snug group-hover:text-gold-500 transition-colors truncate">
                                                                    {appt.title}
                                                                </h3>
                                                                <div className="flex items-center text-sm text-slate-400 mt-1 gap-1.5">
                                                                    <User size={13} className="text-slate-500 shrink-0" />
                                                                    <span className="text-slate-300 truncate">{clientName}</span>
                                                                </div>
                                                                <div className="flex items-center text-xs text-slate-500 mt-1.5 gap-1.5">
                                                                    <Clock size={12} className="shrink-0" />
                                                                    {format(new Date(appt.startTime), 'h:mm a')} — {format(new Date(appt.endTime), 'h:mm a')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: Badge + Actions */}
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.bg} ${status.text} border-current/10`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                                {status.label}
                                                            </span>

                                                            {appt.price && (
                                                                <span className="text-sm font-semibold text-gold-400 bg-gold-500/5 px-2.5 py-1 rounded-lg border border-gold-500/10">
                                                                    €{Number(appt.price).toFixed(0)}
                                                                </span>
                                                            )}

                                                            <DropdownMenu.Root>
                                                                <DropdownMenu.Trigger asChild>
                                                                    <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors outline-none">
                                                                        <MoreVertical size={18} />
                                                                    </button>
                                                                </DropdownMenu.Trigger>
                                                                
                                                                <DropdownMenu.Portal>
                                                                    <DropdownMenu.Content className="min-w-[210px] bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-2xl shadow-black/50 z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                                                                        <DropdownMenu.Item 
                                                                            onSelect={() => {
                                                                                setSelectedAppointment(appt);
                                                                                setIsEditModalOpen(true);
                                                                            }}
                                                                            className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition-colors"
                                                                        >
                                                                            <Edit2 size={15} className="mr-2 text-slate-400" />
                                                                            Edit Appointment
                                                                        </DropdownMenu.Item>

                                                                        <DropdownMenu.Item 
                                                                            onSelect={() => handleWhatsAppReminder(appt)}
                                                                            className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                                                                        >
                                                                            <MessageCircle size={15} className="mr-2 text-emerald-500" />
                                                                            WhatsApp Reminder
                                                                        </DropdownMenu.Item>

                                                                        <DropdownMenu.Item 
                                                                            onSelect={() => handleWhatsAppAftercare(appt)}
                                                                            className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-pink-500/10 hover:text-pink-400 rounded-lg cursor-pointer transition-colors"
                                                                        >
                                                                            <Heart size={15} className="mr-2 text-pink-500" />
                                                                            Send Aftercare
                                                                        </DropdownMenu.Item>

                                                                        <DropdownMenu.Separator className="h-px bg-slate-800 my-1" />

                                                                        <DropdownMenu.Item 
                                                                            onSelect={() => handleStatusChange(appt.id, 'COMPLETED')}
                                                                            className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                                                                        >
                                                                            <CheckCircle size={15} className="mr-2 text-emerald-500" />
                                                                            Mark as Completed
                                                                        </DropdownMenu.Item>
                                                                        
                                                                        <DropdownMenu.Item 
                                                                            onSelect={() => handleStatusChange(appt.id, 'CANCELLED')}
                                                                            className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-orange-500/10 hover:text-orange-400 rounded-lg cursor-pointer transition-colors"
                                                                        >
                                                                            <XCircle size={15} className="mr-2 text-orange-500" />
                                                                            Cancel Appointment
                                                                        </DropdownMenu.Item>

                                                                        <DropdownMenu.Separator className="h-px bg-slate-800 my-1" />

                                                                        <DropdownMenu.Item 
                                                                            onSelect={() => handleDelete(appt.id)}
                                                                            className="flex items-center px-3 py-2.5 text-sm outline-none hover:bg-red-500/10 text-red-500 rounded-lg cursor-pointer transition-colors"
                                                                        >
                                                                            <Trash2 size={15} className="mr-2" />
                                                                            Delete
                                                                        </DropdownMenu.Item>
                                                                    </DropdownMenu.Content>
                                                                </DropdownMenu.Portal>
                                                            </DropdownMenu.Root>
                                                        </div>
                                                    </div>

                                                    {/* Deposit / Balance row */}
                                                    {(Number(appt.price) > 0 || appt.deposit > 0) && (
                                                        <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-800/60 bg-slate-950/40 text-xs">
                                                            <span className="text-slate-500">Total: <span className="text-slate-300 font-medium">€{Number(appt.price || 0).toFixed(0)}</span></span>
                                                            <span className="text-slate-500">Deposit: <span className="text-emerald-400 font-medium">€{Number(appt.deposit || 0).toFixed(0)}</span></span>
                                                            <span className="text-slate-500">Balance: <span className="text-gold-400 font-medium">€{(Number(appt.price || 0) - Number(appt.deposit || 0)).toFixed(0)}</span></span>
                                                        </div>
                                                    )}
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
                                        <CalendarIcon size={28} className="text-slate-500" />
                                    </div>
                                    <h3 className="text-base font-medium text-slate-200 mb-1">No appointments</h3>
                                    <p className="text-slate-500 text-sm max-w-xs">
                                        {searchTerm 
                                            ? `No results matching "${searchTerm}"` 
                                            : `Nothing scheduled for ${format(selectedDate, 'MMMM d, yyyy')}`}
                                    </p>
                                    {!searchTerm && (
                                        <Button 
                                            onClick={() => setIsNewModalOpen(true)} 
                                            className="mt-6 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                        >
                                            <Plus size={16} className="mr-1.5" /> Book for this day
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            <NewBookingModal open={isNewModalOpen} onOpenChange={setIsNewModalOpen} />
            <EditBookingModal 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen} 
                appointment={selectedAppointment} 
            />

            {/* Custom styles for react-day-picker in dark theme + dot indicators */}
            <style>{`
                .rdp {
                    --rdp-cell-size: 36px;
                    --rdp-accent-color: #d4a853;
                    margin: 0;
                }
                .rdp-day--has-appt::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #d4a853;
                }
                .rdp-day_selected.rdp-day--has-appt::after {
                    background: #0f172a;
                }
            `}</style>
        </div>
    );
};
