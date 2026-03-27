import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface UseInstallPromptReturn {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<boolean>;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const isInstallPrompt = (e: Event): e is BeforeInstallPromptEvent =>
      'prompt' in e && typeof (e as BeforeInstallPromptEvent).prompt === 'function';

    const handler = (e: Event): void => {
      e.preventDefault();
      if (isInstallPrompt(e)) setDeferredPrompt(e);
    };

    const installed = (): void => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return result.outcome === 'accepted';
  };

  return { canInstall: !!deferredPrompt && !isInstalled, isInstalled, install };
}
