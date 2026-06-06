import React, { useState, useEffect } from 'react';
import { Text, TextProps } from 'react-native';
import { useLanguage, LANGUAGE_NAMES } from '@/hooks/use-language';
import { translateText } from '@/lib/google-translate';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TranslatedTextProps extends TextProps {
  children: string;
}

/**
 * A Text component that automatically translates its content using Puter AI
 * if the current language is not English.
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({ children, style, ...props }) => {
  const { language } = useLanguage();
  const [displayText, setDisplayText] = useState(children);

  useEffect(() => {
    const performTranslation = async () => {
      if (language === 'en' || !children) {
        setDisplayText(children);
        return;
      }

      const targetLang = LANGUAGE_NAMES[language];
      const cacheKey = `text_trans_${children.substring(0, 50)}_${language}`;
      
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setDisplayText(cached);
        } else {
          const translated = await translateText(children, targetLang);
          await AsyncStorage.setItem(cacheKey, translated);
          setDisplayText(translated);
        }
      } catch (e) {
        console.error('[TRANS] Component translation failed:', e);
        setDisplayText(children);
      }
    };

    performTranslation();
  }, [children, language]);

  return (
    <Text style={style} {...props}>
      {displayText}
    </Text>
  );
};
