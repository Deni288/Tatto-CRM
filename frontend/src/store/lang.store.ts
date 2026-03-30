import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'hr' | 'en';

interface LangStore {
    lang: Lang;
    setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangStore>()(
    persist(
        (set) => ({
            lang: 'hr',
            setLang: (lang) => set({ lang }),
        }),
        { name: 'tcrm-lang' },
    ),
);
