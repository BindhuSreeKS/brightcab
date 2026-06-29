import React, { useState } from 'react';
import { 
  Home, 
  History, 
  Wallet, 
  Bell, 
  User, 
  Menu, 
  X, 
  Shield, 
  HeadphonesIcon, 
  Settings,
  MapPin,
  Star,
  LogOut
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui';
import logo from '../logo.png';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', href: '/customer', icon: Home },
  { label: 'Activity', href: '/customer/activity', icon: History },
  { label: 'Wallet', href: '/customer/wallet', icon: Wallet },
  { label: 'Alerts', href: '/customer/notifications', icon: Bell },
  { label: 'Profile', href: '/customer/profile', icon: User },
];

const SIDEBAR_ITEMS = [
  ...BOTTOM_NAV_ITEMS,
  { label: 'Safety', href: '/customer/safety', icon: Shield },
  { label: 'Support', href: '/customer/support', icon: HeadphonesIcon },
  { label: 'Settings', href: '/customer/settings', icon: Settings },
];

export const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const hideNav = location.pathname.includes('/tracking') || location.pathname.includes('/auth');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-0 lg:pl-64 flex flex-col transition-colors duration-300">
      
      {/* Mobile Top Header (Minimal) */}
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
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates On</span>
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

          <div className="px-6 mb-8 text-center">
             <div className="relative inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" 
                  alt="Customer" 
                  className="w-16 h-16 rounded-3xl border-2 border-indigo-500 shadow-lg object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900">
                   <Star className="w-3 h-3 fill-current" />
                </div>
             </div>
             <p className="mt-3 font-black text-slate-900 dark:text-white uppercase tracking-tight">Anjali Sharma</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium Member</p>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {SIDEBAR_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
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

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-3 rounded-2xl font-bold">
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full lg:max-w-none lg:p-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 h-20 px-2 flex items-center justify-around z-40">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600"
              )}
            >
              <item.icon className={cn("w-6 h-6 transition-transform", location.pathname === item.href && "scale-110")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {location.pathname === item.href && (
                <div className="absolute top-2 w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* SOS Button Overlay */}
      <Button 
        className="fixed bottom-24 right-4 lg:bottom-12 lg:right-12 w-16 h-16 rounded-[2rem] bg-red-600 hover:bg-red-700 text-white shadow-2xl z-50 flex flex-col items-center justify-center p-0 border-none group active:scale-95 transition-transform"
      >
        <Shield className="w-6 h-6 group-hover:animate-bounce" />
        <span className="font-bold text-[10px] uppercase mt-1">SOS</span>
      </Button>

      {/* Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
