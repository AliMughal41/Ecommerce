import { useState, useEffect } from 'react';

export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch { /* ignore */ }
    return initialValue;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
  }, [key, value]);

  return [value, setValue];
}
