import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { motion } from 'framer-motion';

export const Login = () => {
    const [email, setEmail] = useState('artist@tattoo.com');
    const [password, setPassword] = useState('password123');
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Real API Call
        login(
            { id: '1', name: 'Ink Master', email, role: 'ARTIST' },
            'mock-jwt-token-123'
        );
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-wider mb-2">
                            <span className="text-gold-500">TATT</span>CRM
                        </h1>
                        <p className="text-slate-400 text-sm">Sign in to manage your studio</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
