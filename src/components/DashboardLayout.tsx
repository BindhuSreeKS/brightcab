import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Car, Map, CreditCard,
  AlertCircle, Bell, Settings, PieChart, ShieldCheck,
  Globe, DollarSign, Megaphone, History, ChevronRight,
  Menu, LogOut, Search, User as UserIcon, Sun, Moon, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.png';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ADMIN_NAV_ITEMS: (NavItem | { label: string; icon: React.ElementType; subItems: NavItem[] })[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Driver Onboarding',
    icon: UserCheck,
    subItems: [
      { label: 'Overview', href: '/admin/onboarding', icon: PieChart },
      { label: 'Applications', href: '/admin/onboarding/applications', icon: Users },
      { label: 'Doc Verification', href: '/admin/onboarding/documents', icon: ShieldCheck },
      { label: 'Vehicle Verification', href: '/admin/onboarding/vehicles', icon: Car },
      { label: 'Pending Approvals', href: '/admin/onboarding/approvals', icon: AlertCircle },
      { label: 'Approved Drivers', href: '/admin/onboarding/approved', icon: UserCheck },
      { label: 'Rejected Apps', href: '/admin/onboarding/rejected', icon: AlertCircle },
      { label: 'Background Checks', href: '/admin/onboarding/background', icon: ShieldCheck },
      { label: 'Activation Queue', href: '/admin/onboarding/activation', icon: Loader2 },
      { label: 'Analytics', href: '/admin/onboarding/analytics', icon: PieChart },
    ]
  },
  { label: 'Drivers', href: '/admin/drivers', icon: Users },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Rides', href: '/admin/rides', icon: Car },
  { label: 'Live Tracking', href: '/admin/tracking', icon: Map },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Complaints', href: '/admin/complaints', icon: AlertCircle },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Reports', href: '/admin/reports', icon: PieChart },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Admin Management', href: '/super-admin/admins', icon: Users },
  { label: 'Roles & Permissions', href: '/super-admin/roles', icon: ShieldCheck },
  { label: 'City Management', href: '/super-admin/cities', icon: Globe },
  { label: 'Pricing & Commission', href: '/super-admin/pricing', icon: DollarSign },
  { label: 'Promotions', href: '/super-admin/promotions', icon: Megaphone },
  { label: 'Revenue & Analytics', href: '/super-admin/analytics', icon: PieChart },
  { label: 'Audit Logs', href: '/super-admin/audit', icon: History },
  { label: 'Security Monitoring', href: '/super-admin/security', icon: AlertCircle },
  { label: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
];

export const DashboardLayout = ({ children, role }: { children: React.ReactNode; role: 'ADMIN' | 'SUPER_ADMIN' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>(['Driver Onboarding']);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = role === 'ADMIN' ? ADMIN_NAV_ITEMS : SUPER_ADMIN_NAV_ITEMS;

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-800">
            <div className={cn(
              "relative group transition-all duration-500 hover:scale-105",
              isSidebarOpen ? "w-[180px] h-11" : "w-11 h-11"
            )}>
              {/* Ambient Pulse Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition duration-500"></div>
              
              {/* Inner Glassmorphism Container with Gradient Border */}
              <div className={cn(
                "relative bg-white/95 backdrop-blur-xl rounded-xl p-[1.2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl transition-all duration-500",
                isSidebarOpen ? "w-[180px] h-11" : "w-11 h-11"
              )}>
                <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center p-1">
                  <img src={logo} alt="Vazraa mobility" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Role badge */}
          {isSidebarOpen && (
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                role === 'SUPER_ADMIN'
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                  : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
              )}>
                <ShieldCheck className="w-3 h-3" />
                {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 custom-scrollbar">
            {navItems.map((item) => {
              if ('subItems' in item) {
                const isOpen = openMenus.includes(item.label) && isSidebarOpen;
                const hasActiveChild = item.subItems.some(sub => location.pathname === sub.href);
                
                return (
                  <div key={item.label} className="space-y-0.5">
                    <button
                      onClick={() => isSidebarOpen ? toggleMenu(item.label) : null}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        hasActiveChild && !isOpen
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", hasActiveChild ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
                      {isSidebarOpen && <span className="text-sm flex-1 text-left">{item.label}</span>}
                      {isSidebarOpen && (
                        <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
                      )}
                    </button>
                    {isOpen && (
                      <div className="ml-4 pl-4 border-l border-slate-100 dark:border-slate-800 space-y-0.5">
                        {item.subItems.map((sub) => {
                          const isActive = location.pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              to={sub.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                                isActive
                                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                                  : "text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                              )}
                            >
                              <sub.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
                              <span className="text-xs">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
                  {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                  {isActive && isSidebarOpen && <ChevronRight className="ml-auto w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isSidebarOpen && user && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title={!isSidebarOpen ? 'Logout' : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              {loggingOut ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> : <LogOut className="w-5 h-5 shrink-0" />}
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300 ease-in-out", isSidebarOpen ? "ml-64" : "ml-20")}>
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1">
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search rides, drivers, customers..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative p-2">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </Button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() ?? <UserIcon className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="flex-1 p-6 lg:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};
