import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gooeyToast } from 'goey-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterInput } from '@tattoocrm/shared';
import { Card } from '../components/tremor/Card';
import { Input } from '../components/tremor/Input';
import { Label } from '../components/tremor/Label';
import { Button } from '../components/tremor/Button';
import { api } from '../api/axiosInstance';
import { Loader2, MailCheck } from 'lucide-react';

export const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema)
    });

    const onSubmit = async (data: RegisterInput): Promise<void> => {
        setIsLoading(true);
        try {
            await api.post('/auth/register', data);
            setRegisteredEmail(data.email);
            setEmailSent(true);
        } catch (err: unknown) {
            const apiError = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
            gooeyToast.error(apiError ?? 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <Card className="p-8 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
                        <MailCheck className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
                        <p className="text-slate-400 text-sm mb-1">We sent a confirmation link to</p>
                        <p className="text-white font-medium mb-6">{registeredEmail}</p>
                        <p className="text-slate-500 text-xs">Click the link in the email to activate your account. The link expires in 24 hours.</p>
                        <p className="text-center text-sm text-slate-500 mt-6">
                            Wrong email? <Link to="/register" onClick={() => setEmailSent(false)} className="text-gold-500 hover:text-gold-400">Go back</Link>
                        </p>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-wider mb-2 text-white">
                            <span className="text-gold-500">Join</span> Us
                        </h1>
                        <p className="text-slate-400 text-sm">Create an account to manage your studio</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-medium text-slate-300">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                {...register('name')}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-medium text-slate-300">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-medium text-slate-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            variant="gold"
                            className="w-full font-semibold py-3 flex justify-center items-center cursor-pointer"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
                        </Button>
                        
                        <p className="text-center text-sm text-slate-400 mt-4">
                            Already have an account? <Link to="/login" className="text-gold-500 hover:text-gold-400">Sign in here</Link>
                        </p>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};
