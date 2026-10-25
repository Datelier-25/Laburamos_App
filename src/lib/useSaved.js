import { useCallback, useState } from 'react';

const KEY = 'tb_saved_jobs';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

// Avisos guardados en este dispositivo
export default function useSaved() {
  const [saved, setSaved] = useState(read);
  const toggle = useCallback((id) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* sin almacenamiento disponible */
      }
      return next;
    });
  }, []);
  return [saved, toggle];
}
