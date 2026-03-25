import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.schedule')}</h1>
    </div>
  );
};

export default SchedulePage;
