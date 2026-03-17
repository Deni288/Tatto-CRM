import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Link, Check, KeyRound, User } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { Card } from '../components/tremor/Card';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/axiosInstance';

const updateNameSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type UpdateNameInput = z.infer<typeof updateNameSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const inputClass = (hasError: boolean): string =>
    `w-full bg-slate-950 border ${hasError ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors`;

export const Profile = () => {
    const { user, updateUser } = useAuthStore();
    const [linkCopied, setLinkCopied] = useState(false);

    const bookingLink = user ? `${window.location.origin}/book/${user.id}` : '';

    const handleCopyLink = async (): Promise<void> => {
        await navigator.clipboard.writeText(bookingLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    // --- Update Name Form ---
    const {
        register: registerName,
        handleSubmit: handleNameSubmit,
        formState: { errors: nameErrors, isSubmitting: isNameSubmitting },
    } = useForm<UpdateNameInput>({
        resolver: zodResolver(updateNameSchema),
        defaultValues: { name: user?.name ?? '' },
    });

    const onUpdateName = async (data: UpdateNameInput): Promise<void> => {
        try {
            const res = await api.patch('/users/me', data);
            updateUser({ name: res.data.name });
            gooeyToast.success('Name updated successfully');
        } catch {
            gooeyToast.error('Failed to update name');
        }
    };

    // --- Change Password Form ---
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
        reset: resetPassword,
    } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onChangePassword = async (data: ChangePasswordInput): Promise<void> => {
        try {
            await api.patch('/users/me/password', data);
            gooeyToast.success('Password changed successfully');
            resetPassword();
        } catch {
            gooeyToast.error('Current password is incorrect');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Profile</h1>
                <p className="text-sm text-slate-400 mt-1">Manage your account settings.</p>
            </div>

            {/* User Info */}
            <Card className="p-6 bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-bold text-gold-500 shrink-0">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">{user?.name}</p>
                        <p className="text-sm text-slate-400">{user?.email}</p>
                        <span className="mt-1 inline-block text-xs font-medium text-gold-500 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-full">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Update Name */}
            <Card className="p-6 bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-gold-500" />
                    <h2 className="text-base font-semibold text-white">Update Name</h2>
                </div>
                <form onSubmit={handleNameSubmit(onUpdateName)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Display Name</label>
                        <input
                            {...registerName('name')}
                            placeholder="Your name"
                            className={inputClass(!!nameErrors.name)}
                        />
                        {nameErrors.name && <p className="text-red-400 text-xs">{nameErrors.name.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={isNameSubmitting}
                        className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isNameSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Save Name
                    </button>
                </form>
            </Card>

            {/* Change Password */}
            <Card className="p-6 bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <KeyRound size={18} className="text-gold-500" />
                    <h2 className="text-base font-semibold text-white">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Current Password</label>
                        <input
                            type="password"
                            {...registerPassword('currentPassword')}
                            placeholder="••••••••"
                            className={inputClass(!!passwordErrors.currentPassword)}
                        />
                        {passwordErrors.currentPassword && <p className="text-red-400 text-xs">{passwordErrors.currentPassword.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-300">New Password</label>
                            <input
                                type="password"
                                {...registerPassword('newPassword')}
                                placeholder="••••••••"
                                className={inputClass(!!passwordErrors.newPassword)}
                            />
                            {passwordErrors.newPassword && <p className="text-red-400 text-xs">{passwordErrors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                            <input
                                type="password"
                                {...registerPassword('confirmPassword')}
                                placeholder="••••••••"
                                className={inputClass(!!passwordErrors.confirmPassword)}
                            />
                            {passwordErrors.confirmPassword && <p className="text-red-400 text-xs">{passwordErrors.confirmPassword.message}</p>}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isPasswordSubmitting}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPasswordSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Change Password
                    </button>
                </form>
            </Card>

            {/* Booking Link */}
            <Card className="p-6 bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <Link size={18} className="text-gold-500" />
                    <h2 className="text-base font-semibold text-white">Your Booking Link</h2>
                </div>
                <p className="text-sm text-slate-400 mb-3">Share this link with clients so they can send you booking requests.</p>
                <div className="flex gap-2">
                    <input
                        readOnly
                        value={bookingLink}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-400 text-sm focus:outline-none"
                    />
                    <button
                        onClick={handleCopyLink}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0"
                    >
                        {linkCopied ? <Check size={16} className="text-emerald-400" /> : <Link size={16} />}
                        {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </Card>
        </div>
    );
};
