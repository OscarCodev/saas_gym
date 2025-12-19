import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X,
  Bell,
  Check,
  Package,
  UserCheck,
  FileText
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, gym, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Notification Logic
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      // Silently fail - notifications are not critical
      setNotifications([]);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Silently fail - marking as read is not critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Socios', href: '/dashboard/members', icon: Users },
    { name: 'Asistencias', href: '/dashboard/attendance', icon: UserCheck },
    { name: 'Planes', href: '/dashboard/membership-plans', icon: Package },
    { name: 'Reportes', href: '/dashboard/reports', icon: FileText },
    { name: 'Facturación', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    // Exact match for dashboard home
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // For other routes, check exact match first, then check if it's the base path
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-lime-400 truncate">{gym?.name || 'GymCore'}</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${active 
                    ? 'bg-lime-400/10 text-lime-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-lime-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{gym?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-2 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-100">
              {navigation.find(n => isActive(n.href))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4" ref={notificationRef}>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-slate-400 hover:text-white relative p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-lime-400 block ring-2 ring-slate-900" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${!notification.is_read ? 'bg-slate-800/30' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-lime-400' : 'bg-slate-600'}`} />
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.is_read ? 'text-white font-medium' : 'text-slate-400'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-600 mt-2">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-slate-500 hover:text-lime-400 self-start"
                                title="Marcar como leída"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;