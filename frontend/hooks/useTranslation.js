import { useEffect, useState, useMemo } from 'react';
import translations from '../i18n/translations';
import storage from '../auth/storage';

const STORAGE_KEY = 'app_language';
const STORAGE_ENABLED_KEY = 'translations_enabled';

let sharedLanguage = 'en';
let sharedEnabled = false;
let sharedLoading = true;
const subscribers = new Set();

function notifyAll() {
  for (const cb of subscribers) {
    try { cb({ language: sharedLanguage, enabled: sharedEnabled, loading: sharedLoading }); } catch (_) {}
  }
}

async function initShared() {
  try {
    const [saved, savedEnabled] = await Promise.all([
      storage.getItem(STORAGE_KEY),
      storage.getItem(STORAGE_ENABLED_KEY),
    ]);
    if (saved && translations[saved]) sharedLanguage = saved;
    if (savedEnabled != null) sharedEnabled = String(savedEnabled) === 'true';
  } catch (_) {
  } finally {
    sharedLoading = false;
    notifyAll();
  }
}

initShared();

export default function useTranslation() {
  const [language, setLanguageState] = useState(sharedLanguage);
  const [enabled, setEnabledState] = useState(sharedEnabled);
  const [loading, setLoading] = useState(sharedLoading);

  useEffect(() => {
    let mounted = true;
    const cb = ({ language: lang, enabled: en, loading: ld }) => {
      if (!mounted) return;
      setLanguageState(lang);
      setEnabledState(en);
      setLoading(ld);
    };
    subscribers.add(cb);
    cb({ language: sharedLanguage, enabled: sharedEnabled, loading: sharedLoading });
    return () => { mounted = false; subscribers.delete(cb); };
  }, []);

  const setLanguage = async (lang) => {
    if (!lang || !translations[lang]) return;
    sharedLanguage = lang;
    sharedLoading = false;
    notifyAll();
    try { await storage.saveItem(STORAGE_KEY, lang); } catch (_) {}
  };

  const setEnabled = async (val) => {
    const b = !!val;
    sharedEnabled = b;
    sharedLoading = false;
    notifyAll();
    try { await storage.saveItem(STORAGE_ENABLED_KEY, String(b)); } catch (_) {}
  };

  const t = useMemo(() => {
    return (key, fallback = '') => {
      if (!key) return fallback || '';
      const parts = key.split('.');
      const dict = (!enabled ? translations.en : (translations[language] || translations.en));
      let cur = dict;
      for (let p of parts) {
        if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
        else { cur = null; break; }
      }
      if (cur == null) {
        const eng = translations.en;
        let cur2 = eng;
        for (let p of parts) {
          if (cur2 && Object.prototype.hasOwnProperty.call(cur2, p)) cur2 = cur2[p];
          else { cur2 = null; break; }
        }
        return cur2 ?? fallback ?? '';
      }
      return cur;
    };
  }, [language, enabled]);

  return { t, language, setLanguage, loading, enabled, setEnabled };
}
