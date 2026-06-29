import React, { useState } from 'react';
import { 
  Home, 
  Car, 
  Wallet, 
  Bell, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Shield, 
  HeadphonesIcon, 
  Settings,
  AlertCircle
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui';
import { TokenStore } from '../lib/api';
import toast from 'react-hot-toast';
import logo from '../logo.png';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', href: '/driver', icon: Home },
  { label: 'Rides', href: '/driver/rides', icon: Car },
  { label: 'Earnings', href: '/driver/earnings', icon: Wallet },
  { label: 'Alerts', href: '/driver/notifications', icon: Bell },
  { label: 'Profile', href: '/driver/profile', icon: User },
];

const SIDEBAR_ITEMS = [
  ...BOTTOM_NAV_ITEMS,
  { label: 'Safety', href: '/driver/safety', icon: Shield },
  { label: 'Support', href: '/driver/support', icon: HeadphonesIcon },
  { label: 'Settings', href: '/driver/settings', icon: Settings },
];

export const DriverLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [driver] = useState<any>(TokenStore.getDriver());
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    TokenStore.clear();
    toast.success('Logged out successfully');
    navigate('/driver/login');
  };

  // Hide bottom nav on specific pages like active ride or auth
  const hideNav = location.pathname.includes('/active-ride') || location.pathname.includes('/auth');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-0 lg:pl-64 flex flex-col transition-colors duration-300">
      
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center">
            <div className="relative group w-[150px] h-9 hover:scale-105 transition-transform duration-500">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition duration-500"></div>
              <div className="relative w-[150px] h-9 bg-white/95 backdrop-blur-xl rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center p-0.5">
                  <img src={logo} alt="Vazraa mobility" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", driver?.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400')} />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
            {driver?.status || 'Offline'}
          </span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center justify-center w-full">
              <div className="relative group w-[180px] h-11 hover:scale-105 transition-transform duration-500">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition duration-500"></div>
                <div className="relative w-[180px] h-11 bg-white/95 backdrop-blur-xl rounded-xl p-[1.2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                  <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center p-1">
                    <img src={logo} alt="Vazraa mobility" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </Button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {SIDEBAR_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-500">
                {driver?.name?.charAt(0) || 'D'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{driver?.name || 'Driver'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">★ {driver?.rating?.toFixed(1) || '0.0'} Partner</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-3"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full lg:max-w-none">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {!hideNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 h-16 px-2 flex items-center justify-around z-40">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <item.icon className={cn("w-6 h-6", location.pathname === item.href && "animate-bounce")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      {/* SOS Button Overlay (Fixed for mobile) */}
      <Button 
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl z-50 flex items-center justify-center p-0 border-none group"
      >
        <span className="group-hover:scale-110 transition-transform font-bold text-sm">SOS</span>
      </Button>

      {/* Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
