'use client';

import { useEffect } from 'react';

export function EmbedResizeEmitter() {
  useEffect(() => {
    function postHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'sifa-embed-resize', height }, '*');
    }

    postHeight();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return null;
}
