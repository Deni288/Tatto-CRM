import { useRegisterSW } from 'virtual:pwa-register/react';

interface UsePWAReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  close: () => void;
}

let updateInterval: ReturnType<typeof setInterval> | undefined;

export function usePWA(): UsePWAReturn {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error:', error);
    },
  });

  const close = (): void => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return { needRefresh, offlineReady, updateServiceWorker, close };
}
