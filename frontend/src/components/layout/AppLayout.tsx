import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import {
    Users,
    Calendar as CalendarIcon,
    LogOut,
    LayoutDashboard,
    Bell,
    Inbox
} from 'lucide-react';
import { cx } from '../../lib/utils';
import { motion } from 'framer-motion';
import { GlobalSearch } from './GlobalSearch';

export const AppLayout = () => {
    const { isAuthenticated, logout, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Clients', path: '/clients', icon: Users },
        { name: 'Appointments', path: '/appointments', icon: CalendarIcon },
        { name: 'Requests', path: '/booking-requests', icon: Inbox },
    ];

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-slate-950 text-slate-50 selection:bg-gold-500/30">
            {/* Desktop Sidebar (Hide on Mobile) */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shadow-xl shrink-0 z-10 transition-all duration-300">
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="flex items-center h-20 px-6 border-b border-slate-800/50">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-gold-500 to-yellow-600 tracking-wider">
                            Tattoo <span className="text-white">CRM</span>
                        </span>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/50">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-gold-500 shadow-inner">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Artist</span>
                            <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
                        </div>
                    </div>

                    {/* Global Search */}
                    <div className="px-4 py-3 border-b border-slate-800/50">
                        <GlobalSearch />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative flex items-center group"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabDesktop"
                                            className="absolute inset-0 bg-gold-500/10 rounded-xl"
                                        />
                                    )}
                                    <div className={cx(
                                        "relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "text-gold-500 font-semibold"
                                            : "text-slate-400 hover:text-white font-medium hover:bg-slate-800/50"
                                    )}>
                                        <Icon className={cx("w-5 h-5 mr-3 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                                        {item.name}
                                    </div>
                                    {isActive && (
                                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-gold-500" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 mt-auto">
                        <button
                            onClick={() => logout()}
                            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-slate-300 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-full min-w-0 bg-slate-950 pb-20 md:pb-0 relative">
                {/* Mobile Top Header (Visible only on mobile) */}
                <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                    <span className="text-xl font-bold text-gold-500 tracking-wider">
                        Tattoo <span className="text-white">CRM</span>
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="w-40">
                            <GlobalSearch />
                        </div>
                        <button className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-gold-500">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 custom-scrollbar">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-bottom-nav px-6 pb-safe pt-2">
                <nav className="flex items-center justify-between h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-full h-full"
                            >
                                <div className={cx(
                                    "flex flex-col items-center justify-center space-y-1 transition-colors duration-200",
                                    isActive ? "text-gold-500" : "text-slate-400 hover:text-slate-200"
                                )}>
                                    <Icon
                                        className={cx(
                                            "w-6 h-6 transition-transform duration-300",
                                            isActive ? "-translate-y-1 drop-shadow-md" : ""
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span className={cx(
                                        "text-[10px] font-semibold transition-all duration-300",
                                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 absolute bottom-0"
                                    )}>
                                        {item.name}
                                    </span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute top-0 w-8 h-1 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </div>
        </div>
    );
};
