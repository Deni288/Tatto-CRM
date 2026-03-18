import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ARTIST' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setToken: (token: string) => void;
    checkAuth: () => void;
    updateUser: (updates: Partial<Pick<User, 'name'>>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                // Fire-and-forget: clear the httpOnly cookie on server
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                }).catch(() => {});
                set({ user: null, token: null, isAuthenticated: false });
            },

            setToken: (token) => {
                set({ token });
            },

            checkAuth: () => {
                // With Zustand persist middleware, state is automatically hydrated from localStorage.
                // We keep checkAuth for backwards compatibility with App.tsx if needed
            },

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null,
            })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
