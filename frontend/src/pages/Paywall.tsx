import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const Paywall = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-red-100 rounded-full p-4">
                        <Lock className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trial je istekao</h1>
                    <p className="mt-2 text-gray-600">
                        Tvoj 30-dnevni besplatni period je završio. Aktiviraj pretplatu kako bi nastavio koristiti TattoCRM.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/dashboard/billing')}
                    className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                    Pogledaj planove
                </button>

                <p className="text-xs text-gray-400">
                    €22/month · €220/year · Cancel anytime
                </p>
            </div>
        </div>
    );
};
