import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MoreVertical, Loader2, CheckCircle, XCircle, Trash2, Edit2, MessageCircle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Card } from '../components/tremor/Card';
import { Input } from '../components/tremor/Input';
import { Button } from '../components/tremor/Button';
import { Badge } from '../components/tremor/Badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAppointmentStore, type Appointment } from '../store/appointment.store';
import { NewBookingModal } from '../components/appointments/NewBookingModal';
import { EditBookingModal } from '../components/appointments/EditBookingModal';
import { gooeyToast } from 'goey-toast';

export const Appointments = () => {
    const { appointments, isLoading, fetchAppointments, updateStatus, deleteAppointment } = useAppointmentStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const filtered = appointments.filter(appt => {
        const clientName = appt.client ? `${appt.client.firstName} ${appt.client.lastName}` : 'Unknown Client';
        return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               appt.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

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

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Appointments</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage your schedule and bookings</p>
                </div>

                <Button 
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none px-6"
                >
                    <Plus size={18} className="mr-1.5 -ml-1 shrink-0" />
                    New Booking
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        type="search"
                        placeholder="Search by client or title..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
                        Today
                    </Button>
                    <Button variant="secondary" className="bg-slate-800 border-slate-700 text-white font-medium">
                        Upcoming
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                    </div>
                ) : filtered.length > 0 ? (
                    <ul className="divide-y divide-slate-800">
                        {filtered.map((appt, i) => {
                            const clientName = appt.client ? `${appt.client.firstName} ${appt.client.lastName}` : 'Unknown';
                            return (
                                <motion.li
                                    key={appt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-900/50 transition-colors"
                                >
                                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-gold-500 shrink-0 shadow-inner">
                                            <span className="text-xs font-semibold uppercase">{format(new Date(appt.startTime), 'MMM')}</span>
                                            <span className="text-lg font-bold leading-none">{format(new Date(appt.startTime), 'd')}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium text-lg leading-snug group-hover:text-gold-500 transition-colors">
                                                {appt.title}
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">with <span className="text-slate-300">{clientName}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                        <div className="flex flex-col sm:items-end gap-1">
                                            <div className="flex items-center text-sm text-slate-300">
                                                <Clock size={14} className="mr-1.5 text-slate-500" />
                                                {format(new Date(appt.startTime), 'h:mm a')} - {format(new Date(appt.endTime), 'h:mm a')}
                                            </div>
                                            <Badge variant={appt.status === 'SCHEDULED' ? 'success' : 'neutral'}>
                                                {appt.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger asChild>
                                                <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors outline-none">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </DropdownMenu.Trigger>
                                            
                                            <DropdownMenu.Portal>
                                                <DropdownMenu.Content className="min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl shadow-black/40 z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                                                    <DropdownMenu.Item 
                                                        onSelect={() => {
                                                            setSelectedAppointment(appt);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <Edit2 size={16} className="mr-2 text-slate-400" />
                                                        Edit Appointment
                                                    </DropdownMenu.Item>

                                                    <DropdownMenu.Item 
                                                        onSelect={() => handleWhatsAppReminder(appt)}
                                                        className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <MessageCircle size={16} className="mr-2 text-emerald-500" />
                                                        Send WhatsApp Reminder
                                                    </DropdownMenu.Item>

                                                    <DropdownMenu.Separator className="h-px bg-slate-800 my-1" />

                                                    <DropdownMenu.Item 
                                                        onSelect={() => handleStatusChange(appt.id, 'COMPLETED')}
                                                        className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-slate-800 hover:text-green-400 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <CheckCircle size={16} className="mr-2 text-green-500" />
                                                        Mark as Completed
                                                    </DropdownMenu.Item>
                                                    
                                                    <DropdownMenu.Item 
                                                        onSelect={() => handleStatusChange(appt.id, 'CANCELLED')}
                                                        className="flex items-center px-3 py-2.5 text-sm text-slate-200 outline-none hover:bg-slate-800 hover:text-orange-400 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <XCircle size={16} className="mr-2 text-orange-500" />
                                                        Cancel Appointment
                                                    </DropdownMenu.Item>

                                                    <DropdownMenu.Separator className="h-px bg-slate-800 my-1" />

                                                    <DropdownMenu.Item 
                                                        onSelect={() => handleDelete(appt.id)}
                                                        className="flex items-center px-3 py-2.5 text-sm outline-none hover:bg-red-500/10 text-red-500 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 size={16} className="mr-2" />
                                                        Delete
                                                    </DropdownMenu.Item>
                                                </DropdownMenu.Content>
                                            </DropdownMenu.Portal>
                                        </DropdownMenu.Root>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <CalendarIcon size={48} className="text-slate-700 mb-4" />
                        <h3 className="text-lg font-medium text-slate-200 mb-1">No appointments found</h3>
                        <p className="text-slate-400 max-w-sm">
                            {searchTerm ? `No appointments matching "${searchTerm}"` : "You haven't scheduled any appointments yet."}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setIsNewModalOpen(true)} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white border-none">
                                New Booking
                            </Button>
                        )}
                    </div>
                )}
            </Card>

            <NewBookingModal open={isNewModalOpen} onOpenChange={setIsNewModalOpen} />
            <EditBookingModal 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen} 
                appointment={selectedAppointment} 
            />
        </div>
    );
};
