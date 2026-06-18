import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Home, Package, Tag, Heart, MapPin, User, 
  Wallet, Bell, RefreshCw, Settings, LogOut, Menu, X 
} from 'lucide-react';
import authStore from '../../store/authStore';

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/account/dashboard', icon: Home },
  { label: 'My Orders', path: '/account/orders', icon: Package },
  { label: 'Coupons', path: '/account/coupons', icon: Tag },
  { label: 'Wishlist', path: '/account/wishlist', icon: Heart },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Profile', path: '/account/profile', icon: User },
  { label: 'Wallet', path: '/account/wallet', icon: Wallet },
  { label: 'Notifications', path: '/account/notifications', icon: Bell },
  { label: 'Returns', path: '/account/returns', icon: RefreshCw },
  { label: 'Settings', path: '/account/settings', icon: Settings },
];

export default function PortalLayout() {
  const { user, logout } = authStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'SC';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-blue-100/50">
      {/* Sidebar header banner */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
        {/* Decorative background graphics */}
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-500/30 rounded-full blur-lg"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-14 h-14 rounded-full border-2 border-white/20 object-cover shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/10 flex items-center justify-center font-heading font-extrabold text-lg tracking-wider text-white shadow-inner">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-base tracking-tight truncate">
              {user?.name || 'SwiftCart Customer'}
            </h3>
            <p className="text-xs text-blue-100 truncate mt-0.5">
              {user?.email || 'customer@swiftcart.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 border-l-4 ${
                isActive
                  ? 'portal-sidebar-active'
                  : 'text-gray-500 border-transparent hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button at the footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border-l-4 border-transparent hover:border-red-500 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="portal-bg min-h-screen font-body flex flex-col">
      {/* Mobile Top Menu Bar */}
      <div className="md:hidden sticky top-16 z-30 bg-white border-b border-blue-100/40 px-4 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-9 h-9 rounded-full object-cover border border-blue-100"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-heading font-bold text-xs text-white">
              {getInitials(user?.name)}
            </div>
          )}
          <span className="font-heading font-extrabold text-sm text-gray-800 tracking-wide">
            {user?.name?.split(' ')[0]}'s Account
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-600 hover:text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Slide-out Overlay Drawer for Mobile Screen Widths */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop shade */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer body container */}
          <div className="relative flex flex-col w-80 max-w-[85%] bg-white h-full shadow-2xl z-10 animate-slide-right">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row relative">
        {/* Desktop Sidebar Column */}
        <aside className="hidden md:block w-72 sticky top-20 h-[calc(100vh-5rem)] flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Content routing container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
