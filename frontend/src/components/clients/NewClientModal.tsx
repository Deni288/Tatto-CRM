import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormData } from '@tattoocrm/shared';
import { useClientStore } from '../../store/client.store';
import { Button } from '../tremor/Button';
import { Input } from '../tremor/Input';
import { gooeyToast } from 'goey-toast';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewClientModal = ({ open, onOpenChange }: Props) => {
    const addClient = useClientStore(state => state.addClient);
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            tattooHistory: ''
        }
    });

    const onSubmit = async (data: ClientFormData) => {
        try {
            // Zamjeni prazna polja s undefined/null specifično za naš backend ako treba, ali zod literali to handleaju.
            await addClient(data);
            gooeyToast.success('Klijent uspješno dodan');
            reset();
            onOpenChange(false);
        } catch (error: unknown) {
            const apiErr = error as { response?: { data?: { error?: string } }; message?: string };
            const errorMsg = apiErr.response?.data?.error ?? apiErr.message ?? 'Greška pri dodavanju klijenta';
            gooeyToast.error(errorMsg);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => {
            if (!val) reset(); // reset form if closed without saving
            onOpenChange(val);
        }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-800 bg-slate-950 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                        <Dialog.Title className="text-xl font-bold leading-none tracking-tight text-white">
                            Add New Client
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-slate-400">
                            Enter the details of the new client to add them to your database.
                        </Dialog.Description>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">First Name <span className="text-gold-500">*</span></label>
                                <Input {...register('firstName')} placeholder="John" className={errors.firstName ? "border-red-500" : ""} />
                                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Last Name <span className="text-gold-500">*</span></label>
                                <Input {...register('lastName')} placeholder="Doe" className={errors.lastName ? "border-red-500" : ""} />
                                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <Input {...register('email')} type="email" placeholder="john@example.com" className={errors.email ? "border-red-500" : ""} />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Phone</label>
                            <Input {...register('phone')} placeholder="+38761234567" />
                            <p className="text-xs text-slate-500">Međunarodni format: +38761234567 (BiH), +385911234567 (HR)</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tattoo History / Notes</label>
                            <textarea 
                                {...register('tattooHistory')} 
                                className="flex min-h-[100px] w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Previous work, allergies, skin type..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold border-none" isLoading={isSubmitting}>
                                Save Client
                            </Button>
                        </div>
                    </form>
                    
                    <Dialog.Close asChild>
                        <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-slate-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-800 data-[state=open]:text-slate-400">
                            <X className="h-4 w-4 text-slate-400" />
                            <span className="sr-only">Close</span>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
