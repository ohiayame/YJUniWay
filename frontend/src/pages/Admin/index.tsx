import { useTranslation } from 'react-i18next';

const AdminPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.admin')}</h1>
    </div>
  );
};

export default AdminPage;
