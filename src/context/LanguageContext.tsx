import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tr from '../i18n/tr';
import en from '../i18n/en';

type Lang = 'tr' | 'en';
type Translations = typeof tr;

interface LanguageContextType {
  t: Translations;
  lang: Lang;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  t: tr,
  lang: 'tr',
  toggleLang: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('tr');

  useEffect(() => {
    AsyncStorage.getItem('lang').then((val) => {
      if (val === 'en') setLang('en');
    });
  }, []);

  const toggleLang = async () => {
    const next: Lang = lang === 'tr' ? 'en' : 'tr';
    setLang(next);
    await AsyncStorage.setItem('lang', next);
  };

  const t = lang === 'tr' ? tr : en;

  return (
    <LanguageContext.Provider value={{ t, lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);