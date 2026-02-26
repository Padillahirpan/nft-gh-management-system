import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/talang', label: 'Talang', icon: '🌿' },
    { path: '/sensor', label: 'Sensor Log', icon: '📡' },
    { path: '/harvest', label: 'Panen', icon: '🌾' },
    { path: '/alert', label: 'Alert', icon: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-greenhouse-700 flex items-center gap-2">
              🌿 NFT Greenhouse
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manajemen Kebun Selada</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-greenhouse-50 hover:text-greenhouse-700 transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-greenhouse-100 flex items-center justify-center">
                <span className="text-greenhouse-700 font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || 'Operator'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
