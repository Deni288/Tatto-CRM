import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormInput } from '@tattoocrm/shared';
import { Input } from '../tremor/Input';
import { Label } from '../tremor/Label';
import { Button } from '../tremor/Button';
import { useClientStore } from '../../store/client.store';
import { useAppointmentStore } from '../../store/appointment.store';
import { gooeyToast } from 'goey-toast';

interface SuccessData {
    clientName: string;
    clientPhone: string | null;
    title: string;
    startTime: string;
}

interface NewBookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function roundTo15Min(date: Date): string {
    const rounded = new Date(date);
    rounded.setMinutes(Math.ceil(rounded.getMinutes() / 15) * 15, 0, 0);
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${rounded.getFullYear()}-${pad(rounded.getMonth() + 1)}-${pad(rounded.getDate())}T${pad(rounded.getHours())}:${pad(rounded.getMinutes())}`;
}

export const NewBookingModal = ({ open, onOpenChange }: NewBookingModalProps) => {
    const { clients, fetchClients, selectedClient, fetchClientById } = useClientStore();
    const { addAppointment } = useAppointmentStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);

    const now = new Date();
    const defaultStart = roundTo15Min(now);
    const defaultEnd = roundTo15Min(new Date(now.getTime() + 60 * 60 * 1000));

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AppointmentFormInput>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: { startTime: defaultStart, endTime: defaultEnd },
    });

    useEffect(() => {
        if (open) fetchClients();
    }, [open, fetchClients]);

    const handleClose = () => {
        reset();
        setSuccessData(null);
        onOpenChange(false);
    };

    const handleWhatsApp = (data: SuccessData) => {
        const phone = data.clientPhone?.replace(/[^0-9]/g, '') ?? '';
        const date = new Date(data.startTime).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' });
        const time = new Date(data.startTime).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
        const message = encodeURIComponent(`Bok ${data.clientName}! ✅ Tvoj termin je potvrđen.\n\n📅 ${date} u ${time}\n💉 ${data.title}\n\nVidimo se!`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const onSubmit = async (data: AppointmentFormInput) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
            };

            await addAppointment(payload);

            if (selectedClient?.id === payload.clientId) {
                await fetchClientById(payload.clientId);
            }

            const client = clients.find(c => c.id === payload.clientId);
            setSuccessData({
                clientName: client ? `${client.firstName} ${client.lastName}` : 'klijent',
                clientPhone: client?.phone ?? null,
                title: data.title,
                startTime: payload.startTime,
            });
            reset();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            gooeyToast.error(err?.response?.data?.error || 'Failed to create booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
                        <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                            {successData ? 'Booking Created!' : 'New Booking'}
                        </Dialog.Title>
                        <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                            <X size={20} />
                        </button>
                    </div>

                    {successData ? (
                        <div className="p-8 flex flex-col items-center text-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">Termin je kreiran!</p>
                                <p className="text-slate-400 text-sm mt-1">
                                    Email potvrda je poslana {successData.clientName}.
                                </p>
                            </div>
                            <div className="w-full flex flex-col gap-3">
                                {successData.clientPhone && (
                                    <Button
                                        onClick={() => handleWhatsApp(successData)}
                                        className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 font-semibold"
                                    >
                                        <MessageCircle size={17} className="mr-2" />
                                        Pošalji WhatsApp potvrdu
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={handleClose} className="w-full">
                                    Zatvori
                                </Button>
                            </div>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                        
                        <div className="space-y-2">
                            <Label htmlFor="clientId" className="text-slate-300">Client</Label>
                            <select
                                id="clientId"
                                {...register('clientId')}
                                className={`w-full bg-slate-950 border ${errors.clientId ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 appearance-none`}
                            >
                                <option value="" disabled selected hidden>Select a client...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.firstName} {client.lastName}
                                    </option>
                                ))}
                            </select>
                            {errors.clientId && <p className="text-red-400 text-xs">{errors.clientId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-300">Appointment Title / Type</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Traditional Sleeve Session 1"
                                {...register('title')}
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime" className="text-slate-300">Start Time</Label>
                                <input
                                    id="startTime"
                                    type="datetime-local"
                                    step="900"
                                    {...register('startTime')}
                                    className={`w-full bg-slate-950 border ${errors.startTime ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50`}
                                />
                                {errors.startTime && <p className="text-red-400 text-xs">{errors.startTime.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime" className="text-slate-300">End Time</Label>
                                <input
                                    id="endTime"
                                    type="datetime-local"
                                    step="900"
                                    {...register('endTime')}
                                    className={`w-full bg-slate-950 border ${errors.endTime ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50`}
                                />
                                {errors.endTime && <p className="text-red-400 text-xs">{errors.endTime.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-slate-300">Est. Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('price', { valueAsNumber: true })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="depositAmount" className="text-slate-300">Deposit ($)</Label>
                                <Input
                                    id="depositAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('depositAmount', { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-300">Notes / Description (Optional)</Label>
                            <textarea
                                id="description"
                                rows={3}
                                {...register('description')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none"
                                placeholder="Any special requests or prep notes..."
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/80">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => onOpenChange(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-white border-none"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                variant="gold"
                                className="font-semibold min-w-[120px] flex justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Booking'}
                            </Button>
                        </div>
                    </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
