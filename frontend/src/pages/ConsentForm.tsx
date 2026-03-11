import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldAlert } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { SignaturePad } from '../components/ui/SignaturePad';
import { Card } from '../components/tremor/Card';
import { Checkbox } from '../components/tremor/Checkbox';
import { Label } from '../components/tremor/Label';
import { Button } from '../components/tremor/Button';

// Mock context for the form
const MOCK_DATA = {
    clientName: 'Sarah Connor',
    appointmentDate: 'March 15, 2026',
    tattooDetails: 'Full left sleeve (Japanese Traditional)',
};

export const ConsentForm = () => {
    const navigate = useNavigate();
    const [signature, setSignature] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        acknowledgedRisks: false,
        notUnderInfluence: false,
        providedTrueInfo: false,
        photoConsent: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!signature) {
            gooeyToast.error('Please provide your signature.');
            return;
        }
        // Simulate API call
        console.log({ formData, signature });
        gooeyToast.success('Consent form submitted successfully!');
        navigate('/appointments');
    };

    const allRequiredChecked = formData.acknowledgedRisks && formData.notUnderInfluence && formData.providedTrueInfo;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden"
            >
                <div className="p-6 md:p-10 border-b border-white/5 bg-white/2">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400">Tattoo Consent Form</h1>
                            <p className="text-slate-400">Please read carefully and sign before your procedure.</p>
                        </div>
                    </div>

                    <div className="mt-6 p-6 bg-black/40 border border-white/5 rounded-2xl text-sm grid grid-cols-1 md:grid-cols-2 gap-6 shadow-inner">
                        <div>
                            <span className="text-slate-500 block mb-1">Client Name</span>
                            <span className="text-white font-medium">{MOCK_DATA.clientName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block mb-1">Date</span>
                            <span className="text-white font-medium">{MOCK_DATA.appointmentDate}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-slate-500 block mb-1">Procedure Details</span>
                            <span className="text-white font-medium">{MOCK_DATA.tattooDetails}</span>
                        </div>
                    </div>
                </div>

                <Card className="p-0 border-white/10 shadow-2xl overflow-hidden mt-6">
                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Agreements & Acknowledgments</h3>

                            <div className="flex items-start space-x-4 p-4 rounded-xl border border-white/5 bg-white/1 hover:bg-white/3 hover:border-white/10 transition-all duration-300">
                                <Checkbox
                                    id="risk-consent"
                                    checked={formData.acknowledgedRisks}
                                    onCheckedChange={(checked) => setFormData(p => ({ ...p, acknowledgedRisks: checked === true }))}
                                    className="mt-1"
                                />
                                <Label htmlFor="risk-consent" className="text-slate-300 text-sm leading-relaxed cursor-pointer font-normal">
                                    I acknowledge that receiving a tattoo involves inherent risks, including but not limited to infection, allergic reactions to pigments, and scarring. I assume all responsibility for these risks.
                                </Label>
                            </div>

                            <div className="flex items-start space-x-4 p-4 rounded-xl border border-white/5 bg-white/1 hover:bg-white/3 hover:border-white/10 transition-all duration-300">
                                <Checkbox
                                    id="influence-consent"
                                    checked={formData.notUnderInfluence}
                                    onCheckedChange={(checked) => setFormData(p => ({ ...p, notUnderInfluence: checked === true }))}
                                    className="mt-1"
                                />
                                <Label htmlFor="influence-consent" className="text-slate-300 text-sm leading-relaxed cursor-pointer font-normal">
                                    I am not currently under the influence of alcohol, drugs, or any medication that could impair my judgment or thin my blood (e.g., Aspirin, Ibuprofen) within the last 24 hours.
                                </Label>
                            </div>

                            <div className="flex items-start space-x-4 p-4 rounded-xl border border-white/5 bg-white/1 hover:bg-white/3 hover:border-white/10 transition-all duration-300">
                                <Checkbox
                                    id="truth-consent"
                                    checked={formData.providedTrueInfo}
                                    onCheckedChange={(checked) => setFormData(p => ({ ...p, providedTrueInfo: checked === true }))}
                                    className="mt-1"
                                />
                                <Label htmlFor="truth-consent" className="text-slate-300 text-sm leading-relaxed cursor-pointer font-normal">
                                    I confirm that all medical history and personal information provided to the artist is true and accurate to the best of my knowledge.
                                </Label>
                            </div>

                            <div className="flex items-start space-x-4 p-4 rounded-xl border border-white/5 bg-white/1 hover:bg-white/3 hover:border-white/10 transition-all duration-300">
                                <Checkbox
                                    id="photo-consent"
                                    checked={formData.photoConsent}
                                    onCheckedChange={(checked) => setFormData(p => ({ ...p, photoConsent: checked === true }))}
                                    className="mt-1"
                                />
                                <Label htmlFor="photo-consent" className="text-slate-300 text-sm leading-relaxed cursor-pointer font-normal">
                                    <span className="text-slate-500 font-semibold mr-2">(Optional)</span>
                                    I grant permission for the artist to photograph my tattoo and use the images for portfolio, social media, and promotional purposes.
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Digital Signature</h3>
                            <SignaturePad onSignatureChange={setSignature} />
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <Button
                                type="submit"
                                disabled={!allRequiredChecked || !signature}
                                className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-slate-900 border-none justify-center disabled:opacity-50"
                            >
                                <Check className="mr-2" size={20} />
                                Sign and Submit Consent Form
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};
