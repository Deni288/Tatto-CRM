import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { consentFormSchema, type ConsentFormData } from '@tattoocrm/shared';
import { Input } from '../tremor/Input';
import { Label } from '../tremor/Label';
import { Button } from '../tremor/Button';
import { useConsentStore } from '../../store/consent.store';
import { gooeyToast } from 'goey-toast';

interface NewConsentFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
}

export const NewConsentFormModal = ({ open, onOpenChange, clientId }: NewConsentFormModalProps) => {
    const { createConsent } = useConsentStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ConsentFormData>({
        resolver: zodResolver(consentFormSchema),
        defaultValues: {
            medicalConditions: '',
            allergies: '',
            signatureName: '',
        }
    });

    const onSubmit = async (data: ConsentFormData) => {
        setIsSubmitting(true);
        try {
            await createConsent(clientId, {
                ...data,
                medicalConditions: data.medicalConditions || null,
                allergies: data.allergies || null,
            });
            
            gooeyToast.success('Consent form saved successfully!');
            reset();
            onOpenChange(false);
        } catch (error: any) {
            gooeyToast.error(error?.response?.data?.error || 'Failed to save consent form');
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
                            Digital Consent Form
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        
                        <div className="space-y-2">
                            <Label htmlFor="medicalConditions" className="text-slate-300">Medical Conditions (Optional)</Label>
                            <textarea
                                id="medicalConditions"
                                rows={3}
                                {...register('medicalConditions')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none"
                                placeholder="List any medical conditions relevant to tattooing..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allergies" className="text-slate-300">Allergies (Optional)</Label>
                            <textarea
                                id="allergies"
                                rows={2}
                                {...register('allergies')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none"
                                placeholder="List any known allergies..."
                            />
                        </div>

                        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 space-y-4">
                            <h4 className="text-sm font-semibold text-slate-200">Legal Agreement</h4>
                            <div className="flex items-start space-x-3">
                                <input 
                                    type="checkbox" 
                                    id="agreedToTerms" 
                                    {...register('agreedToTerms')}
                                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-gold-500/50"
                                />
                                <Label htmlFor="agreedToTerms" className="text-sm text-slate-400 font-normal leading-snug">
                                    I acknowledge the risks of tattooing, confirm I am 18+, and consent to the procedure. I confirm that the information provided above is true and accurate.
                                </Label>
                            </div>
                            {errors.agreedToTerms && <p className="text-red-400 text-xs ml-7">{errors.agreedToTerms.message}</p>}
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label htmlFor="signatureName" className="text-slate-300">Digital Signature</Label>
                            <Input
                                id="signatureName"
                                placeholder="Type your full legal name to sign"
                                {...register('signatureName')}
                                className={errors.signatureName ? "border-red-500" : ""}
                            />
                            {errors.signatureName && <p className="text-red-400 text-xs">{errors.signatureName.message}</p>}
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
                                className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold border-none min-w-[140px] flex justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign & Complete'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
