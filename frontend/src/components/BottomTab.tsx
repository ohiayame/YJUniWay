import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import { useAppSelector } from '../hooks/useAppSelector';

const TABS = [
  { path: '/',          icon: HomeIcon,          label: 'home' },
  { path: '/dormitory', icon: ApartmentIcon,      label: 'dormitory' },
  { path: '/schedule',  icon: CalendarMonthIcon,  label: 'schedule' },
  { path: '/students',  icon: GroupIcon,          label: 'students', adminOnly: true },
];

export default function BottomTab() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = useAppSelector((state) => state.auth.isAdmin);

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      borderTop: '1px solid #eee',
      background: 'white',
      padding: '8px 0 6px',
      zIndex: 100,
    }}>
      {visibleTabs.map(({ path, icon: Icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: active ? '#1a1a2e' : '#aaa',
              fontWeight: active ? 'bold' : 'normal',
              fontSize: 10,
              padding: '2px 0',
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
