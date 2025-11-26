import { useEffect } from 'react';

export function useBarcodeScanner(
  onScan: (barcode: string) => void,
  mode: 'enter' | 'timer',
  scanTimeout = 40,
) {
  useEffect(() => {
    let buffer = '';
    let lastTime = Date.now();
    let timeoutId: number | undefined;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if (mode === 'enter') {
        if (e.key.length === 1) buffer += e.key;
        if (e.key === 'Enter' || e.key === 'Tab') {
          if (buffer.length > 0) onScan(buffer);
          buffer = '';
        }
      } else {
        const now = Date.now();
        if (now - lastTime > scanTimeout) buffer = '';
        lastTime = now;
        if (e.key.length === 1) buffer += e.key;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          if (buffer.length >= 5) onScan(buffer);
          buffer = '';
        }, scanTimeout);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onScan, mode, scanTimeout]);
}

export function getBarcodeMode(): 'enter' | 'timer' {
  return localStorage.getItem('barcodeMode') === 'timer' ? 'timer' : 'enter';
}

export function setBarcodeMode(mode: 'enter' | 'timer') {
  localStorage.setItem('barcodeMode', mode);
}
