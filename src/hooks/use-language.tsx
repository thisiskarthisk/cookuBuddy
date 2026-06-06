import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

/**
 * CookuBuddy - Global Localization System
 * Manages app-wide language state and translations for 6 supported languages.
 */

export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'mr' | 'bn';

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  te: 'Telugu',
  mr: 'Marathi',
  bn: 'Bengali'
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
  isLanguageLoading: boolean;
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
    cooking_list: 'Cooking List',
    ingredients_purchase: 'Ingredients Purchase',
    type_ingredient: 'Type ingredient...',
    empty_notepad: 'Your notepad is empty.',
    add_items_needed: 'Add items you need to buy.',
    clear_all: 'Clear All Items',
    clear_confirm_title: 'Clear All?',
    clear_confirm_msg: 'Are you sure you want to delete all items from your shopping list?',
    delete_all: 'Delete All',
    cancel: 'Cancel',
    list_empty: 'List Empty',
    add_before_pdf: 'Add some ingredients before downloading.',
    pdf_error: 'Failed to generate PDF.',
    error: 'Error',
    start_purchase: 'Start Ingredient Purchase',
    enter_recipe_name: 'Enter Recipe Name...',
    create_notepad: 'Create Notepad',
    new_list: 'New List',
    ingredient: 'Ingredient',
    ingredients_plural: 'Ingredients',
    no_lists_yet: 'No cooking lists yet',
    tap_new_list: "Tap 'New List' to start organizing your ingredients",
    delete_list_confirm: 'Are you sure you want to delete this entire cooking list?',
    ingredients_first: 'Ingredients First',
    ingredients_first_msg: 'Please prepare and check off all ingredients before viewing the cooking steps.',
    cooking_complete_title: 'Yum! Cooking Complete! 🎉',
    cooking_complete_msg: 'Delicious job! We have reset your checkboxes so you can easily prepare this dish next time.',
    awesome: 'Awesome!',
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
    cooking_list: 'சமையல் பட்டியல்',
    ingredients_purchase: 'பொருட்கள் வாங்குதல்',
    type_ingredient: 'பொருளைத் தட்டச்சு செய்க...',
    empty_notepad: 'உங்கள் நோட்பேடு காலியாக உள்ளது.',
    add_items_needed: 'நீங்கள் வாங்க வேண்டிய பொருட்களைச் சேர்க்கவும்.',
    clear_all: 'அனைத்து பொருட்களையும் நீக்கு',
    clear_confirm_title: 'அனைத்தையும் நீக்கவா?',
    clear_confirm_msg: 'உங்கள் ஷாப்பிங் பட்டியலிலிருந்து அனைத்து பொருட்களையும் நீக்க விரும்புகிறீர்களா?',
    delete_all: 'அனைத்தையும் நீக்கு',
    cancel: 'ரத்துசெய்',
    list_empty: 'பட்டியல் காலியாக உள்ளது',
    add_before_pdf: 'பதிவிறக்குவதற்கு முன் சில பொருட்களைச் சேர்க்கவும்.',
    pdf_error: 'PDF ஐ உருவாக்க முடியவில்லை.',
    error: 'பிழை',
    start_purchase: 'பொருட்கள் வாங்குவதைத் தொடங்குங்கள்',
    enter_recipe_name: 'செய்முறை பெயரை உள்ளிடவும்...',
    create_notepad: 'நோட்பேடை உருவாக்கவும்',
    new_list: 'புதிய பட்டியல்',
    ingredient: 'பொருள்',
    ingredients_plural: 'பொருட்கள்',
    no_lists_yet: 'சமையல் பட்டியல்கள் எதுவும் இல்லை',
    tap_new_list: "உங்கள் பொருட்களை ஒழுங்கமைக்க 'புதிய பட்டியல்' என்பதைத் தட்டவும்",
    delete_list_confirm: 'இந்த முழு சமையல் பட்டியலையும் நீக்க விரும்புகிறீர்களா?',
    ingredients_first: 'முதலில் பொருட்கள்',
    ingredients_first_msg: 'சமையல் படிகளைப் பார்ப்பதற்கு முன் அனைத்து பொருட்களையும் தயார் செய்து சரிபார்க்கவும்.',
    cooking_complete_title: 'வாழ்த்துகள்! சமையல் முடிந்தது! 🎉',
    cooking_complete_msg: 'சிறந்த வேலை! அடுத்த முறை இந்த உணவை எளிதாகத் தயாரிக்க உங்கள் செக்பாக்ஸை நாங்கள் ரீசெட் செய்துள்ளோம்.',
    awesome: 'அற்புதம்!',
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
    cooking_list: 'कुकिंग लिस्ट',
    ingredients_purchase: 'सामग्री खरीद',
    type_ingredient: 'सामग्री टाइप करें...',
    empty_notepad: 'आपका नोटपैड खाली है।',
    add_items_needed: 'वे आइटम जोड़ें जिन्हें आपको खरीदने की आवश्यकता है।',
    clear_all: 'सभी आइटम साफ़ करें',
    clear_confirm_title: 'सभी साफ़ करें?',
    clear_confirm_msg: 'क्या आप वाकई अपनी खरीदारी सूची से सभी आइटम हटाना चाहते हैं?',
    delete_all: 'सभी हटाएं',
    cancel: 'रद्द करें',
    list_empty: 'सूची खाली है',
    add_before_pdf: 'डाउनलोड करने से पहले कुछ सामग्री जोड़ें।',
    pdf_error: 'PDF जनरेट करने में विफल।',
    error: 'त्रुटि',
    start_purchase: 'सामग्री खरीद शुरू करें',
    enter_recipe_name: 'रेसिपी का नाम दर्ज करें...',
    create_notepad: 'नोटपैड बनाएं',
    new_list: 'नई सूची',
    ingredient: 'सामग्री',
    ingredients_plural: 'सामग्री',
    no_lists_yet: 'अभी तक कोई कुकिंग लिस्ट नहीं है',
    tap_new_list: "अपनी सामग्री व्यवस्थित करना शुरू करने के लिए 'नई सूची' पर टैप करें",
    delete_list_confirm: 'क्या आप वाकई इस पूरी कुकिंग लिस्ट को हटाना चाहते हैं?',
    ingredients_first: 'पहले सामग्री',
    ingredients_first_msg: 'खाना पकाने के चरणों को देखने से पहले कृपया सभी सामग्री तैयार करें और उन पर निशान लगाएं।',
    cooking_complete_title: 'वाह! खाना पकना पूरा हुआ! 🎉',
    cooking_complete_msg: 'शानदार काम! हमने आपके चेकबॉक्स रीसेट कर दिए हैं ताकि आप अगली बार आसानी से यह डिश बना सकें।',
    awesome: 'बहुत बढ़िया!',
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
    cooking_list: 'వంట జాబితా',
    ingredients_purchase: 'పదార్థాల కొనుగోలు',
    type_ingredient: 'పదార్థాన్ని టైప్ చేయండి...',
    empty_notepad: 'మీ నోట్‌ప్యాడ్ ఖాళీగా ఉంది.',
    add_items_needed: 'మీరు కొనవలసిన వస్తువులను జోడించండి.',
    clear_all: 'அனைத்து వస్తువులను క్లియర్ చేయండి',
    clear_confirm_title: 'అన్నీ క్లియర్ చేయాలా?',
    clear_confirm_msg: 'మీరు ఖచ్చితంగా మీ షాపింగ్ జాబితా నుండి అన్ని వస్తువులను తొలగించాలనుకుంటున్నారా?',
    delete_all: 'అన్నీ తొలగించు',
    cancel: 'రద్దు చేయి',
    list_empty: 'జాబితా ఖాళీగా ఉంది',
    add_before_pdf: 'డౌన్‌లోడ్ చేయడానికి ముందు కొన్ని పదార్థాలను జోడించండి.',
    pdf_error: 'PDFని రూపొందించడంలో విఫలమైంది.',
    error: 'లోపం',
    start_purchase: 'పదార్థాల కొనుగోలు ప్రారంభించండి',
    enter_recipe_name: 'రెసిపీ పేరును నమోదు చేయండి...',
    create_notepad: 'నోట్‌ప్యాడ్‌ని సృష్టించండి',
    new_list: 'కొత్త జాబితా',
    ingredient: 'పదార్థం',
    ingredients_plural: 'పదార్థాలు',
    no_lists_yet: 'ఇంకా వంట జాబితాలు లేవు',
    tap_new_list: "మీ పదార్థాలను నిర్వహించడం ప్రారంభించడానికి 'కొత్త జాబితా' నొక్కండి",
    delete_list_confirm: 'మీరు ఖచ్చితంగా ఈ వంట జాబితాను తొలగించాలనుకుంటున్నారా?',
    ingredients_first: 'ముందుగా పదార్థాలు',
    ingredients_first_msg: 'వంట దశలను చూసే ముందు దయచేసి అన్ని పదార్థాలను సిద్ధం చేసి టిక్ చేయండి.',
    cooking_complete_title: 'యుమ్! వంట పూర్తయింది! 🎉',
    cooking_complete_msg: 'చక్కని పని! మీరు తదుపరిసారి ఈ వంటకాన్ని సులభంగా తయారు చేయగలిగేలా మేము మీ చెక్‌బాక్స్‌లను రీసెట్ చేసాము.',
    awesome: 'అద్భుతం!',
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
    cooking_list: 'कुकिंग लिस्ट',
    ingredients_purchase: 'साहित्य खरेदी',
    type_ingredient: 'साहित्य टाइप करा...',
    empty_notepad: 'तुमचे नोटपॅड रिकामे आहे.',
    add_items_needed: 'तुम्हाला खरेदी करायच्या असलेल्या वस्तू जोडा.',
    clear_all: 'सर्व आयटम साफ करा',
    clear_confirm_title: 'सर्व साफ करायचे?',
    clear_confirm_msg: 'तुम्हाला तुमच्या खरेदी सूचीतील सर्व आयटम हटवायचे आहेत याची खात्री आहे का?',
    delete_all: 'सर्व हटवा',
    cancel: 'रद्द करा',
    list_empty: 'सूची रिकामी आहे',
    add_before_pdf: 'डाउनलोड करण्यापूर्वी काही साहित्य जोडा.',
    pdf_error: 'PDF तयार करण्यात अपयशी.',
    error: 'त्रुटी',
    start_purchase: 'साहित्य खरेदी सुरू करा',
    enter_recipe_name: 'रेसिपीचे नाव प्रविष्ट करा...',
    create_notepad: 'नोटपॅड तयार करा',
    new_list: 'नवीन सूची',
    ingredient: 'साहित्य',
    ingredients_plural: 'साहित्य',
    no_lists_yet: 'अजून कोणतीही कुकिंग लिस्ट नाही',
    tap_new_list: "तुमचे साहित्य व्यवस्थापित करण्यासाठी 'नवीन सूची' वर टॅप करा",
    delete_list_confirm: 'तुम्हाला खात्री आहे की तुम्ही ही संपूर्ण कुकिंग लिस्ट हटवू इच्छिता?',
    ingredients_first: 'आधी साहित्य',
    ingredients_first_msg: 'स्वयंपाकाच्या पायऱ्या पाहण्यापूर्वी कृपया सर्व साहित्य तयार करा आणि तपासा.',
    cooking_complete_title: 'व्वा! स्वयंपाक पूर्ण झाला! 🎉',
    cooking_complete_msg: 'उत्कृष्ट काम! आम्ही तुमचे चेकबॉक्स रीसेट केले आहेत जेणेकरणून तुम्ही पुढच्या वेळी सहजपणे हा पदार्थ बनवू शकाल.',
    awesome: 'छान!',
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
    recipes: 'রেসিपी',
    dark_mode: 'ডার্ক মোড',
    sign_out: 'সাইন আউট করুন',
    account_settings: 'অ্যাকাউন্ট সেটিংস',
    support: 'সহায়তা',
    loading: 'বিকল্পগুলি লোড হচ্ছে...',
    no_results: 'কোন রেসিপি পাওয়া যায়নি',
    back: 'পিছনে',
    favorites: 'প্রিয়',
    cooking_list: 'রান্নার তালিকা',
    ingredients_purchase: 'উপকরণ ক্রয়',
    type_ingredient: 'উপকরণ লিখুন...',
    empty_notepad: 'আপনার নোটপ্যাড খালি।',
    add_items_needed: 'আপনার প্রয়োজনীয় উপকরণগুলি যোগ করুন।',
    clear_all: 'সব মুছে ফেলুন',
    clear_confirm_title: 'সব মুছবেন?',
    clear_confirm_msg: 'আপনি কি নিশ্চিত যে আপনি আপনার তালিকা থেকে সব কিছু মুছতে চান?',
    delete_all: 'সব মুছুন',
    cancel: 'বাতিল',
    list_empty: 'তালিকা খালি',
    add_before_pdf: 'ডাউনলোড করার আগে কিছু উপকরণ যোগ করুন।',
    pdf_error: 'PDF তৈরি করতে ব্যর্থ।',
    error: 'ত্রুটি',
    start_purchase: 'উপকরণ ক্রয় শুরু করুন',
    enter_recipe_name: 'রেসিপির নাম লিখুন...',
    create_notepad: 'নোটপ্যাড তৈরি করুন',
    new_list: 'নতুন তালিকা',
    ingredient: 'উপকরণ',
    ingredients_plural: 'উপকরণসমূহ',
    no_lists_yet: 'এখনও কোনো রান্নার তালিকা নেই',
    tap_new_list: "আপনার উপকরণগুলি গোছাতে 'নতুন তালিকা' ট্যাপ করুন",
    delete_list_confirm: 'আপনি কি নিশ্চিত যে আপনি এই পুরো তালিকাটি মুছতে চান?',
    ingredients_first: 'আগে উপকরণ',
    ingredients_first_msg: 'রান্নার ধাপগুলি দেখার আগে দয়াকরে সব উপকরণ প্রস্তুত করুন এবং টিক দিন।',
    cooking_complete_title: 'দারুণ! রান্না সম্পন্ন হয়েছে! 🎉',
    cooking_complete_msg: 'চমৎকার কাজ! আমরা আপনার চেকবক্সগুলি রিসেট করেছি যাতে আপনি পরের বার সহজেই এই খাবারটি তৈরি করতে পারেন।',
    awesome: 'চমৎকার!',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<LanguageCode>('en');
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
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
    setIsLanguageLoading(true);
    setLang(lang);
    await AsyncStorage.setItem(getStorageKey(), lang);
    setTimeout(() => {
      setIsLanguageLoading(false);
    }, 800);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLanguageLoading }}>
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
