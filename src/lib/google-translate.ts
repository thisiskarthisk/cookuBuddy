
/**
 * Google Translate API Utility
 * Uses the internal Google Translate API for quick translations.
 * NOTE: For production, use the official Google Cloud Translation API.
 */

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || targetLanguage === 'en') return text;

  // Cleanup text to avoid URI encoding issues with very large strings
  const cleanText = text.trim();
  if (cleanText.length === 0) return text;

  try {
    const langMap: Record<string, string> = {
      'Tamil': 'ta',
      'Hindi': 'hi',
      'Telugu': 'te',
      'Marathi': 'mr',
      'Bengali': 'bn',
      'English': 'en'
    };

    const targetCode = langMap[targetLanguage] || targetLanguage;
    
    // Use a mirror/alternative endpoint if possible, but for now we'll add retry logic
    const fetchWithRetry = async (url: string, retries = 2): Promise<Response> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res;
      } catch (e) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
          return fetchWithRetry(url, retries - 1);
        }
        throw e;
      }
    };

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(cleanText)}`;
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join('');
    }
    
    return text;
  } catch (error) {
    console.warn(`[TRANS] Translation failed for: "${text.substring(0, 20)}...", returning original.`, error);
    return text;
  }
}

export async function translateArray(arr: string[], targetLanguage: string): Promise<string[]> {
  if (!arr || arr.length === 0 || targetLanguage === 'en') return arr;

  // Join items with a unique delimiter that Google Translate won't mess up too much
  // Newlines usually work well as Google translates each line
  const joined = arr.join('\n');
  const translated = await translateText(joined, targetLanguage);
  
  // Split back, being careful with potential extra newlines
  return translated.split('\n').map((item, index) => item.trim() || arr[index]);
}

export async function translateObject(obj: any, targetLanguage: string): Promise<any> {
  if (typeof obj === 'string') {
    return translateText(obj, targetLanguage);
  }

  if (Array.isArray(obj)) {
    // Optimization: if it's an array of strings, translate them together
    if (obj.every(i => typeof i === 'string')) {
      return translateArray(obj as string[], targetLanguage);
    }
    return Promise.all(obj.map(item => translateObject(item, targetLanguage)));
  }

  if (typeof obj === 'object' && obj !== null) {
    const translatedObj: any = {};
    for (const key in obj) {
      translatedObj[key] = await translateObject(obj[key], targetLanguage);
    }
    return translatedObj;
  }

  return obj;
}
