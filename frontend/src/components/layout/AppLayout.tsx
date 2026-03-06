import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import {
    Users,
    Calendar as CalendarIcon,
    LogOut,
    LayoutDashboard,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export const AppLayout = () => {
    const { isAuthenticated, logout, user } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Clients', path: '/clients', icon: Users },
        { name: 'Appointments', path: '/appointments', icon: CalendarIcon },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-50">
            {/* Mobile sidebar overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex-shrink-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                        <span className="text-xl font-bold text-gold-500 tracking-wider">TATT<span className="text-white">CRM</span></span>
                        <button
                            className="lg:hidden text-slate-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="px-4 py-4 space-y-1">
                        <div className="pb-4 mb-4 border-b border-slate-800 text-sm">
                            <p className="text-slate-400">Welcome,</p>
                            <p className="font-medium text-white truncate">{user?.name}</p>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                            isActive
                                                ? "bg-gold-500/10 text-gold-500"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-slate-800">
                        <button
                            onClick={() => logout()}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <header className="flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800 lg:hidden">
                    <button
                        className="text-slate-400 hover:text-white select-none"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <span className="text-lg font-bold text-gold-500 tracking-wider">TATT<span className="text-white">CRM</span></span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
