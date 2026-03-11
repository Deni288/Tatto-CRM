import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { motion } from 'framer-motion';
import { gooeyToast } from 'goey-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../components/tremor/Card';
import { Input } from '../components/tremor/Input';
import { Label } from '../components/tremor/Label';
import { Button } from '../components/tremor/Button';
import { api } from '../api/axiosInstance';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', data);
            login(response.data.user, response.data.token);
            gooeyToast.success('Account created successfully!');
            navigate('/');
        } catch (error: any) {
            gooeyToast.error(error.response?.data?.error || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

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
                            className="w-full bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold py-3 border-none flex justify-center items-center cursor-pointer"
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
