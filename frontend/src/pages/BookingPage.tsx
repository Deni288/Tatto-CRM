import { useState, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingRequestSchema, type BookingRequestFormData } from '@tattoocrm/shared';
import { Loader2, CheckCircle, Sparkles, Upload, X } from 'lucide-react';
import { useBookingRequestStore } from '../store/bookingRequest.store';
import { useBookingImageUpload } from '../hooks/useBookingImageUpload';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const BookingPage = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const { submitRequest, isLoading } = useBookingRequestStore();
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!artistId) return <Navigate to="/" replace />;

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BookingRequestFormData>({
        resolver: zodResolver(bookingRequestSchema),
    });
    const { imageUrl, previewUrl, isUploading, error: uploadError, handleFileSelect, clearImage } = useBookingImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = async (data: BookingRequestFormData) => {
        try {
            await submitRequest(artistId, { ...data, referenceImageUrl: imageUrl ?? undefined });
            setIsSubmitted(true);
            reset();
            clearImage();
        } catch {
            // Error handled in store
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Request Submitted!</h2>
                    <p className="text-slate-400 mb-8">
                        Thank you for your booking request. We'll review it and get back to you soon!
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles size={28} className="text-gold-500" />
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-gold-500 to-yellow-600 tracking-wider">
                            Tattoo <span className="text-white">CRM</span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Book Your Session</h1>
                    <p className="text-slate-400">Fill out the form below and we'll get back to you with availability.</p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
                            <input
                                id="name"
                                {...register('name')}
                                placeholder="John Doe"
                                className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors`}
                            />
                            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>

                        {/* Email + Phone row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="you@example.com"
                                    className={`w-full bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors`}
                                />
                                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Phone</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    {...register('phone')}
                                    placeholder="+385 91 123 4567"
                                    className={`w-full bg-slate-950 border ${errors.phone ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors`}
                                />
                                {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Tattoo Idea */}
                        <div className="space-y-2">
                            <label htmlFor="tattooIdea" className="block text-sm font-medium text-slate-300">Tattoo Idea</label>
                            <textarea
                                id="tattooIdea"
                                rows={4}
                                {...register('tattooIdea')}
                                placeholder="Describe your tattoo idea, style, size, placement..."
                                className={`w-full bg-slate-950 border ${errors.tattooIdea ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors resize-none`}
                            />
                            {errors.tattooIdea && <p className="text-red-400 text-xs">{errors.tattooIdea.message}</p>}
                        </div>

                        {/* Reference Link */}
                        <div className="space-y-2">
                            <label htmlFor="referenceLink" className="block text-sm font-medium text-slate-300">
                                Reference Image/Link <span className="text-slate-600">(Optional)</span>
                            </label>
                            <input
                                id="referenceLink"
                                {...register('referenceLink')}
                                placeholder="https://pinterest.com/pin/..."
                                className={`w-full bg-slate-950 border ${errors.referenceLink ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors`}
                            />
                            {errors.referenceLink && <p className="text-red-400 text-xs">{errors.referenceLink.message}</p>}
                        </div>

                        {/* Reference Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">
                                Reference Image <span className="text-slate-600">(Optional)</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void handleFileSelect(file);
                                    setValue('referenceImageUrl', undefined);
                                }}
                            />
                            {previewUrl ? (
                                <div className="relative rounded-lg overflow-hidden border border-slate-700">
                                    <img src={previewUrl} alt="Reference preview" className="w-full max-h-48 object-contain bg-slate-950" />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-gold-500 w-8 h-8" />
                                        </div>
                                    )}
                                    {!isUploading && (
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors"
                                        >
                                            <X size={14} className="text-slate-300" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border border-dashed border-slate-700 hover:border-gold-500/50 rounded-lg px-4 py-6 flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <Upload size={20} />
                                    <span className="text-sm">Click to upload image</span>
                                    <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
                                </button>
                            )}
                            {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
                        </div>

                        {/* Preferred Month */}
                        <div className="space-y-2">
                            <label htmlFor="preferredMonth" className="block text-sm font-medium text-slate-300">Preferred Month</label>
                            <select
                                id="preferredMonth"
                                {...register('preferredMonth')}
                                className={`w-full bg-slate-950 border ${errors.preferredMonth ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 appearance-none transition-colors`}
                            >
                                <option value="" disabled selected hidden>Select a month...</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            {errors.preferredMonth && <p className="text-red-400 text-xs">{errors.preferredMonth.message}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Submit Booking Request'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    We'll contact you within 24–48 hours to confirm your booking.
                </p>
            </div>
        </div>
    );
};
