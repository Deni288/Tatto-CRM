import { motion } from 'framer-motion';

export const Dashboard = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back. Here's your studio activity for today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {[
                    { label: "Today's Appointments", value: 3, color: "text-blue-400" },
                    { label: "New Clients this Week", value: 12, color: "text-emerald-400" },
                    { label: "Pending Consent Forms", value: 2, color: "text-amber-400" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 border border-slate-800 p-6 rounded-xl"
                    >
                        <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
                        <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Upcoming appointments placeholder */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-8">
                <h2 className="text-lg font-semibold mb-4">Upcoming Next</h2>
                <div className="py-8 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                    No more appointments for today. Time to design!
                </div>
            </div>
        </div>
    );
};
