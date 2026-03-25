import { useTranslation } from 'react-i18next';

const DormitoryPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.dormitory')}</h1>
    </div>
  );
};

export default DormitoryPage;
