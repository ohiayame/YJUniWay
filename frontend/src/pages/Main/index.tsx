import { useTranslation } from 'react-i18next';

const MainPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('main.title')}</h1>
      <p>{t('main.welcome')}</p>
    </div>
  );
};

export default MainPage;
