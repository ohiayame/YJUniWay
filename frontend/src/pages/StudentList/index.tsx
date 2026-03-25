import { useTranslation } from 'react-i18next';

const StudentListPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.studentList')}</h1>
    </div>
  );
};

export default StudentListPage;
