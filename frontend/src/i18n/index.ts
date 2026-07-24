import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 실제 화면 텍스트는 각 컴포넌트가 isKo 삼항 연산자로 직접 분기하므로 번역 리소스는 비워둠 (언어 토글은 i18n.language/changeLanguage만 사용)
i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: {} },
    ja: { translation: {} },
  },
  lng: 'ja',
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
