import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/tremor/Card';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/axiosInstance';

type VerifyState = 'loading' | 'success' | 'error';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<VerifyState>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const { login } = useAuthStore();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setState('error');
            setErrorMsg('Missing verification token.');
            return;
        }

        api.post<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
            '/auth/verify-email',
            { token },
        )
            .then((res) => {
                login(res.data.user, res.data.token);
                setState('success');
            })
            .catch((err: unknown) => {
                const msg =
                    (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
                    'Verification failed. Please try again.';
                setErrorMsg(msg);
                setState('error');
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
                    {state === 'loading' && (
                        <>
                            <Loader2 className="w-12 h-12 animate-spin text-gold-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-white">Verifying your email…</h1>
                        </>
                    )}

                    {state === 'success' && (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-white mb-2">Email confirmed!</h1>
                            <p className="text-slate-400 text-sm mb-6">Your account is active. Welcome to Tattoo CRM.</p>
                            <Link
                                to="/"
                                className="inline-block px-6 py-3 bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold rounded-xl transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        </>
                    )}

                    {state === 'error' && (
                        <>
                            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-white mb-2">Verification failed</h1>
                            <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
                            <Link
                                to="/register"
                                className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Back to Register
                            </Link>
                        </>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};
