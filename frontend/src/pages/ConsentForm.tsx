import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldAlert } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { SignaturePad } from '../components/ui/SignaturePad';

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
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 md:p-10 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Tattoo Consent Form</h1>
                            <p className="text-slate-400">Please read carefully and sign before your procedure.</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Agreements & Acknowledgments</h3>

                        <label className="flex items-start space-x-4 p-4 rounded-xl border border-slate-800 hover:bg-slate-800/30 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 accent-gold-500 bg-slate-950 border-slate-700 rounded cursor-pointer"
                                checked={formData.acknowledgedRisks}
                                onChange={(e) => setFormData(p => ({ ...p, acknowledgedRisks: e.target.checked }))}
                                required
                            />
                            <span className="text-slate-300 text-sm leading-relaxed">
                                I acknowledge that receiving a tattoo involves inherent risks, including but not limited to infection, allergic reactions to pigments, and scarring. I assume all responsibility for these risks.
                            </span>
                        </label>

                        <label className="flex items-start space-x-4 p-4 rounded-xl border border-slate-800 hover:bg-slate-800/30 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 accent-gold-500 bg-slate-950 border-slate-700 rounded cursor-pointer"
                                checked={formData.notUnderInfluence}
                                onChange={(e) => setFormData(p => ({ ...p, notUnderInfluence: e.target.checked }))}
                                required
                            />
                            <span className="text-slate-300 text-sm leading-relaxed">
                                I am not currently under the influence of alcohol, drugs, or any medication that could impair my judgment or thin my blood (e.g., Aspirin, Ibuprofen) within the last 24 hours.
                            </span>
                        </label>

                        <label className="flex items-start space-x-4 p-4 rounded-xl border border-slate-800 hover:bg-slate-800/30 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 accent-gold-500 bg-slate-950 border-slate-700 rounded cursor-pointer"
                                checked={formData.providedTrueInfo}
                                onChange={(e) => setFormData(p => ({ ...p, providedTrueInfo: e.target.checked }))}
                                required
                            />
                            <span className="text-slate-300 text-sm leading-relaxed">
                                I confirm that all medical history and personal information provided to the artist is true and accurate to the best of my knowledge.
                            </span>
                        </label>

                        <label className="flex items-start space-x-4 p-4 rounded-xl border border-slate-800 hover:bg-slate-800/30 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 accent-gold-500 bg-slate-950 border-slate-700 rounded cursor-pointer"
                                checked={formData.photoConsent}
                                onChange={(e) => setFormData(p => ({ ...p, photoConsent: e.target.checked }))}
                            />
                            <span className="text-slate-300 text-sm leading-relaxed">
                                <span className="text-slate-500 font-semibold mr-2">(Optional)</span>
                                I grant permission for the artist to photograph my tattoo and use the images for portfolio, social media, and promotional purposes.
                            </span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Digital Signature</h3>
                        <SignaturePad onSignatureChange={setSignature} />
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <button
                            type="submit"
                            disabled={!allRequiredChecked || !signature}
                            className="w-full flex items-center justify-center py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gold-500 hover:bg-gold-400 text-slate-950"
                        >
                            <Check className="mr-2" />
                            Sign and Submit Consent Form
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};
