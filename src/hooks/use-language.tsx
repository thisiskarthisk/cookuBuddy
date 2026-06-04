import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

/**
 * CookuBuddy - Global Localization System
 * Manages app-wide language state and translations for 6 supported languages.
 */

export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'mr' | 'bn';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
}

// UI Translations for the application
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    welcome: 'Hello, Chef!',
    find_recipe: 'Find Your Recipe',
    search_placeholder: 'Search premium recipes...',
    discover: 'Discover Recipes',
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    video: 'Video',
    profile: 'Profile',
    recipes: 'Recipes',
    dark_mode: 'Dark Display Mode',
    sign_out: 'Sign Out of Kitchen',
    account_settings: 'Account Settings',
    support: 'Support',
    loading: 'Loading premium matching options...',
    no_results: 'No recipes found',
    back: 'Back',
    favorites: 'Favorites',
  },
  ta: {
    welcome: 'வணக்கம், செஃப்!',
    find_recipe: 'உங்கள் செய்முறையைக் கண்டறியவும்',
    search_placeholder: 'பிரீமியம் சமையல் குறிப்புகளைத் தேடுங்கள்...',
    discover: 'சமையல் குறிப்புகளைக் கண்டறியவும்',
    ingredients: 'தேவையான பொருட்கள்',
    instructions: 'செய்முறை விளக்கம்',
    video: 'வீடியோ',
    profile: 'சுயவிவரம்',
    recipes: 'சமையல் குறிப்புகள்',
    dark_mode: 'டார்க் மோட்',
    sign_out: 'வெளியேறு',
    account_settings: 'கணக்கு அமைப்புகள்',
    support: 'உதவி',
    loading: 'பொருந்தும் விருப்பங்களை ஏற்றுகிறது...',
    no_results: 'சமையல் குறிப்புகள் எதுவும் கிடைக்கவில்லை',
    back: 'பின்செல்',
    favorites: 'பிடித்தவை',
  },
  hi: {
    welcome: 'नमस्ते, शेफ!',
    find_recipe: 'अपनी रेसिपी खोजें',
    search_placeholder: 'प्रीमियम रेसिपी खोजें...',
    discover: 'रेसिपी खोजें',
    ingredients: 'सामग्री',
    instructions: 'निर्देश',
    video: 'वीडियो',
    profile: 'प्रोफ़ाइल',
    recipes: 'रेसिपी',
    dark_mode: 'डार्क मोड',
    sign_out: 'साइन आउट करें',
    account_settings: 'खाता सेटिंग्स',
    support: 'सहायता',
    loading: 'मिलान विकल्प लोड हो रहे हैं...',
    no_results: 'कोई रेसिपी नहीं मिली',
    back: 'पीछे',
    favorites: 'पसंदीदा',
  },
  te: {
    welcome: 'నమస్తే, చెఫ్!',
    find_recipe: 'మీ రెసిపీని కనుగొనండి',
    search_placeholder: 'ప్రీమియం వంటకాలను శోధించండి...',
    discover: 'వంటకాలను కనుగొనండి',
    ingredients: 'కావలసినవి',
    instructions: 'సూచనలు',
    video: 'వీడియో',
    profile: 'ప్రొఫైల్',
    recipes: 'వంటకాలు',
    dark_mode: 'డార్క్ మోడ్',
    sign_out: 'సైన్ అవుట్ చేయండి',
    account_settings: 'ఖాతా సెట్టింగులు',
    support: 'మద్దతు',
    loading: 'సరిపోలే ఎంపికలను లోడ్ చేస్తోంది...',
    no_results: 'వంటకాలు ఏవీ కనుగొనబడలేదు',
    back: 'వెనుకకు',
    favorites: 'ఇష్టమైనవి',
  },
  mr: {
    welcome: 'नमस्ते, शेफ!',
    find_recipe: 'तुमची रेसिपी शोधा',
    search_placeholder: 'प्रीमियम रेसिपी शोधा...',
    discover: 'रेसिपी शोधा',
    ingredients: 'साहित्य',
    instructions: 'सूचना',
    video: 'व्हिडिओ',
    profile: 'प्रोफाइल',
    recipes: 'रेसिपी',
    dark_mode: 'डार्क मोड',
    sign_out: 'साइन आउट करा',
    account_settings: 'खाते सेटिंग्ज',
    support: 'मदत',
    loading: 'पर्याय लोड होत आहेत...',
    no_results: 'कोणतीही रेसिपी सापडली नाही',
    back: 'मागे',
    favorites: 'आवडते',
  },
  bn: {
    welcome: 'হ্যালো, শেফ!',
    find_recipe: 'আপনার রেসিপি খুঁজুন',
    search_placeholder: 'প্রিমিয়াম রেসিপি খুঁজুন...',
    discover: 'রেসিপি আবিষ্কার করুন',
    ingredients: 'উপকরণ',
    instructions: 'নির্দেশাবলী',
    video: 'ভিডিও',
    profile: 'প্রোফাইল',
    recipes: 'রেসিপি',
    dark_mode: 'ডার্ক মোড',
    sign_out: 'সাইন আউট করুন',
    account_settings: 'অ্যাকাউন্ট সেটিংস',
    support: 'সহায়তা',
    loading: 'বিকল্পগুলি লোড হচ্ছে...',
    no_results: 'কোন রেসিপি পাওয়া যায়নি',
    back: 'পিছনে',
    favorites: 'প্রিয়',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<LanguageCode>('en');
  const { user } = useAuth();

  const getStorageKey = () => {
    return user ? `app_language_${user.id}` : 'app_language_guest';
  };

  useEffect(() => {
    // Load persisted language when user changes or on startup
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem(getStorageKey());
      if (savedLang) {
        setLang(savedLang as LanguageCode);
      } else {
        setLang('en'); // Default
      }
    };
    loadLang();
  }, [user]);

  const setLanguage = async (lang: LanguageCode) => {
    setLang(lang);
    await AsyncStorage.setItem(getStorageKey(), lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
