import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './i18n';

import MainPage from './pages/Main';
import DormitoryPage from './pages/Dormitory';
import LaundryPage from './pages/Dormitory/Laundry';
import SchedulePage from './pages/Schedule';
import StudentListPage from './pages/StudentList';
import AdminPage from './pages/Admin';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/dormitory" element={<DormitoryPage />} />
          <Route path="/dormitory/laundry" element={<LaundryPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
