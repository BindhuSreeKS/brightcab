import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellOff, Send, Users, UserCheck, RefreshCw,
  CheckCheck, Trash2, Filter, Search, AlertCircle,
  Info, AlertTriangle, CheckCircle, Megaphone, X,
  ChevronDown, Clock, BellRing
} from 'lucide-react';
import {
  Card, CardHeader, CardContent, Button, Badge, StatsCard
} from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { notificationsApi } from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
type NotifType = 'ALL' | 'SYSTEM' | 'PROMO' | 'ALERT' | 'INFO';
type RecipientType = 'ALL' | 'DRIVERS' | 'CUSTOMERS' | 'SPECIFIC';

const TYPE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  SYSTEM:  { icon: AlertCircle,  color: 'text-red-500 bg-red-50 dark:bg-red-900/20',      label: 'System'      },
  PROMO:   { icon: Megaphone,    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20', label: 'Promotion' },
  ALERT:   { icon: AlertTriangle,color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', label: 'Alert'       },
  INFO:    { icon: Info,         color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20',       label: 'Info'        },
  DEFAULT: { icon: Bell,         color: 'text-slate-500 bg-slate-100 dark:bg-slate-800',   label: 'General'     },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.DEFAULT;
}

// ─── ComposePanel ─────────────────────────────────────────────────────────────
const ComposePanel = ({ onSent }: { onSent: () => void }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<string>('INFO');
  const [recipientType, setRecipientType] = useState<RecipientType>('ALL');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSending(true);
    setError('');
    setSuccess(false);
    try {
      await notificationsApi.send({ title, message, type, recipientType });
      setTitle('');
      setMessage('');
      setSuccess(true);
      onSent();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Broadcast Notification</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipients</label>
          <div className="grid grid-cols-2 gap-2">
            {(['ALL', 'DRIVERS', 'CUSTOMERS'] as RecipientType[]).map(r => (
              <button
                key={r}
                onClick={() => setRecipientType(r)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  recipientType === r
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                }`}
              >
                {r === 'ALL'       && <Users className="w-3 h-3" />}
                {r === 'DRIVERS'   && <UserCheck className="w-3 h-3" />}
                {r === 'CUSTOMERS' && <Users className="w-3 h-3" />}
                {r === 'ALL' ? 'Everyone' : r === 'DRIVERS' ? 'Drivers Only' : 'Customers Only'}
              </button>
            ))}
          </div>
        </div>

        {/* Type selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
          <div className="relative">
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full appearance-none h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(TYPE_META).filter(([k]) => k !== 'DEFAULT').map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Notification title..."
            className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Write your message here..."
            className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" /> Notification sent successfully!
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2"
        >
          {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};

// ─── NotificationRow ──────────────────────────────────────────────────────────
const NotificationRow: React.FC<{ notif: any; onMarkRead: (id: string) => void | Promise<void> }> = ({ notif, onMarkRead }) => {
  const meta = getTypeMeta(notif.type);
  const Icon = meta.icon;
  const isUnread = !notif.read;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
        isUnread
          ? 'bg-indigo-50/60 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
      }`}
    >
      <div className={`p-2.5 rounded-xl shrink-0 ${meta.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm font-bold truncate ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
              {notif.title || 'Untitled'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {notif.message || notif.body}
            </p>
          </div>
          {isUnread && (
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Clock className="w-3 h-3" />
            {formatDate(notif.createdAt)}
          </span>
          <Badge variant={
            notif.type === 'SYSTEM' ? 'error' :
            notif.type === 'PROMO'  ? 'secondary' :
            notif.type === 'ALERT'  ? 'warning' : 'info'
          }>{notif.type || 'INFO'}</Badge>
          {notif.recipientType && (
            <span className="text-[10px] text-slate-400 font-medium">→ {notif.recipientType}</span>
          )}
        </div>
      </div>

      {isUnread && (
        <button
          onClick={() => onMarkRead(notif.id)}
          className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          title="Mark as read"
        >
          <CheckCheck className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const NotificationManagement = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<NotifType>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async (p = 0) => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsApi.getAll(p, 30);
      const data = res.data;
      setNotifications(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications');
      // Fallback demo data
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(page);
  }, [fetchNotifications, page]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // optimistic
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.allSettled(unread.map(n => notificationsApi.markRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = notifications.filter(n => {
    const matchType   = activeFilter === 'ALL' || n.type === activeFilter;
    const matchSearch = !search ||
      (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.message || n.body || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const unreadCount   = notifications.filter(n => !n.read).length;
  const totalCount    = notifications.length;
  const systemCount   = notifications.filter(n => n.type === 'SYSTEM').length;
  const promoCount    = notifications.filter(n => n.type === 'PROMO').length;

  const FILTERS: { key: NotifType; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'SYSTEM', label: 'System' },
    { key: 'ALERT', label: 'Alerts' },
    { key: 'PROMO', label: 'Promos' },
    { key: 'INFO', label: 'Info' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Centre</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Send and manage system-wide notifications for drivers &amp; customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchNotifications(page)} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Sent"     value={totalCount}  icon={Bell}      color="indigo" />
        <StatsCard title="Unread"         value={unreadCount} icon={BellRing}  color="amber"  />
        <StatsCard title="System Alerts"  value={systemCount} icon={AlertCircle} color="red"  />
        <StatsCard title="Promotions"     value={promoCount}  icon={Megaphone} color="blue"   />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error} — showing demo data.
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">Notification Log</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search notifications..."
                    className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap mt-3">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeFilter === f.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                  <BellOff className="w-12 h-12 opacity-40" />
                  <p className="text-sm font-medium">No notifications found</p>
                  {search && <p className="text-xs">Try clearing your search filter</p>}
                </div>
              ) : (
                filtered.map(n => (
                  <NotificationRow key={n.id} notif={n} onMarkRead={handleMarkRead} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Compose panel */}
        <div className="space-y-6">
          <ComposePanel onSent={() => fetchNotifications(0)} />

          {/* Quick stats card */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Type Breakdown</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(TYPE_META).filter(([k]) => k !== 'DEFAULT').map(([key, meta]) => {
                const count = notifications.filter(n => n.type === key).length;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${meta.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{meta.label}</span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {totalCount === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No data to display</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Demo fallback data ───────────────────────────────────────────────────────
const DEMO_NOTIFICATIONS = [
  { id: '1', title: 'System Maintenance Scheduled', message: 'Platform will undergo maintenance on 20 May from 2AM–4AM IST.', type: 'SYSTEM', recipientType: 'ALL', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', title: 'Weekend Promo Active', message: 'Earn 2x surge bonus this Saturday and Sunday. Stay online!', type: 'PROMO', recipientType: 'DRIVERS', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', title: 'New App Version Available', message: 'CabGo driver app v3.2.1 is now available. Please update for the best experience.', type: 'INFO', recipientType: 'DRIVERS', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'High Demand Alert — Mumbai Central', message: 'Surge detected in Mumbai Central area. Move there to earn more!', type: 'ALERT', recipientType: 'DRIVERS', read: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '5', title: 'Referral Bonus Credited', message: 'Your referral bonus of ₹200 has been credited to your wallet.', type: 'PROMO', recipientType: 'CUSTOMERS', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '6', title: 'Ride Policy Update', message: 'Our cancellation policy has been updated. Please review in Settings > Policies.', type: 'INFO', recipientType: 'ALL', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export default NotificationManagement;
