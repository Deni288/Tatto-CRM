import type { ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Wifi } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { useLangStore } from '../../store/lang.store';

const i18n = {
  hr: {
    offlineReady: 'Aplikacija spremna za offline rad',
    newVersion: 'Nova verzija dostupna!',
    later: 'Kasnije',
    update: 'Ažuriraj',
  },
  en: {
    offlineReady: 'App ready for offline use',
    newVersion: 'New version available!',
    later: 'Later',
    update: 'Update',
  },
} as const;

export function PWAUpdateToast(): ReactElement | null {
  const { needRefresh, offlineReady, updateServiceWorker, close } = usePWA();
  const { lang } = useLangStore();
  const t = i18n[lang];

  const isVisible = needRefresh || offlineReady;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl sm:left-auto sm:right-4"
        >
          {offlineReady && (
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-zinc-200">{t.offlineReady}</p>
              <button
                onClick={close}
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-200"
              >
                OK
              </button>
            </div>
          )}

          {needRefresh && (
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-zinc-200">{t.newVersion}</p>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={close}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  {t.later}
                </button>
                <button
                  onClick={() => void updateServiceWorker(true)}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-400"
                >
                  {t.update}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
