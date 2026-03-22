'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const SERVER_ACTION_ERROR = 'Failed to find Server Action';
const TOAST_ID = 'stale-deployment';

export function StaleDeploymentDetector() {
  const shownRef = useRef(false);

  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const message = event.reason?.message ?? String(event.reason ?? '');
      if (!message.includes(SERVER_ACTION_ERROR)) return;
      if (shownRef.current) return;
      shownRef.current = true;

      toast.error('Sifa has been updated since you opened this page.', {
        id: TOAST_ID,
        duration: Infinity,
        description: 'Please refresh to continue editing.',
        action: {
          label: 'Refresh now',
          onClick: () => window.location.reload(),
        },
      });
    }

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return null;
}
