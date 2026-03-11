import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../tremor/Input';
import { Label } from '../tremor/Label';
import { Button } from '../tremor/Button';
import { useClientStore } from '../../store/client.store';
import { useAppointmentStore } from '../../store/appointment.store';
import { gooeyToast } from 'goey-toast';

const appointmentSchema = z.object({
    clientId: z.string().uuid('Please select a client'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    price: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
    depositAmount: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface NewBookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewBookingModal = ({ open, onOpenChange }: NewBookingModalProps) => {
    const { clients, fetchClients } = useClientStore();
    const { addAppointment } = useAppointmentStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
    });

    useEffect(() => {
        if (open) fetchClients();
    }, [open, fetchClients]);

    const onSubmit = async (data: AppointmentFormData) => {
        setIsSubmitting(true);
        try {
            // Reformat datetime-local strings to actual ISO strings for Prisma
            const payload = {
                ...data,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
            };
            
            await addAppointment(payload);
            gooeyToast.success('Booking created successfully!');
            reset();
            onOpenChange(false);
        } catch (error: any) {
            gooeyToast.error(error?.response?.data?.error || 'Failed to create booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => {
            if (!val) reset();
            onOpenChange(val);
        }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
                        <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                            New Booking
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        
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
                                    {...register('price')}
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
                                    {...register('depositAmount')}
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
                                className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold border-none min-w-[120px] flex justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Booking'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
