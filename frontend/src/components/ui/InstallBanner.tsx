import { useState, type ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { useLangStore } from '../../store/lang.store';

const i18n = {
  hr: {
    title: 'Instaliraj Tattoo CRM',
    subtitle: 'Brži pristup, radi i offline',
    install: 'Instaliraj',
    close: 'Zatvori',
  },
  en: {
    title: 'Install Tattoo CRM',
    subtitle: 'Faster access, works offline too',
    install: 'Install',
    close: 'Close',
  },
} as const;

export function InstallBanner(): ReactElement | null {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const { lang } = useLangStore();
  const t = i18n[lang];

  if (!canInstall || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl sm:left-auto sm:right-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Download className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-200">{t.title}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-zinc-500 hover:text-zinc-300"
            aria-label={t.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => void install()}
          className="mt-3 w-full rounded-lg bg-amber-500 py-2 text-sm font-medium text-black hover:bg-amber-400"
        >
          {t.install}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
