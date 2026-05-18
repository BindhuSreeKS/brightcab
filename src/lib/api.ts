// ─── Base API client for CabGo Admin Backend ───────────────────────────────
const BASE_URL = '/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── Token management ────────────────────────────────────────────────────────
export const TokenStore = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('driver_user');
  },
  setDriver: (driver: any) => localStorage.setItem('driver_user', JSON.stringify(driver)),
  getDriver: () => {
    const d = localStorage.getItem('driver_user');
    return d ? JSON.parse(d) : null;
  },
  setCustomer: (customer: any) => localStorage.setItem('customer_user', JSON.stringify(customer)),
  getCustomer: () => {
    const c = localStorage.getItem('customer_user');
    return c ? JSON.parse(c) : null;
  }
};

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = TokenStore.getAccess();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    // Try refresh
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retried = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: { ...headers, 'Authorization': `Bearer ${TokenStore.getAccess()}` } });
      return retried.json();
    } else if (!endpoint.includes('/auth/')) {
      TokenStore.clear();
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/driver')) {
        window.location.href = '/driver/login';
      } else if (currentPath.startsWith('/customer')) {
        window.location.href = '/customer/login';
      } else {
        window.location.href = '/login';
      }
      throw new Error('Session expired');
    }
  }

  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    throw new Error('Invalid JSON response from server');
  }

  if (!res.ok) throw new Error(data.message || `HTTP error ${res.status}`);
  return data;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = TokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success) {
      TokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; admin: any }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  getMe: () => apiFetch<any>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Dashboard API ───────────────────────────────────────────────────────────
export const dashboardApi = {
  getAdminStats: () => apiFetch<any>('/admin/dashboard'),
  getSuperAdminStats: () => apiFetch<any>('/super-admin/dashboard'),
  getRevenueAnalytics: (period = 'month') =>
    apiFetch<any>(`/super-admin/analytics/revenue?period=${period}`),
  getRideAnalytics: (period = 'month') =>
    apiFetch<any>(`/super-admin/analytics/rides?period=${period}`),
  getChartData: () => apiFetch<any[]>('/super-admin/analytics/chart'),
  getCityPerformance: () => apiFetch<any[]>('/super-admin/analytics/cities'),
};

// ─── Drivers API ─────────────────────────────────────────────────────────────
export const driversApi = {
  getAll: (params?: { search?: string; status?: string; verificationStatus?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.verificationStatus) q.set('verificationStatus', params.verificationStatus);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiFetch<PagedResponse<any>>(`/admin/drivers?${q}`);
  },
  getById: (id: string) => apiFetch<any>(`/admin/drivers/${id}`),
  getStats: () => apiFetch<any>('/admin/drivers/stats'),
  verify: (id: string) => apiFetch<any>(`/admin/drivers/${id}/verify`, { method: 'PATCH' }),
  reject: (id: string, reason: string) =>
    apiFetch<any>(`/admin/drivers/${id}/reject?reason=${encodeURIComponent(reason)}`, { method: 'PATCH' }),
  suspend: (id: string) => apiFetch<any>(`/admin/drivers/${id}/suspend`, { method: 'PATCH' }),
  activate: (id: string) => apiFetch<any>(`/admin/drivers/${id}/activate`, { method: 'PATCH' }),
};

// ─── Onboarding API ──────────────────────────────────────────────────────────
export const onboardingApi = {
  getApplications: () => apiFetch<any[]>('/admin/onboarding/applications'),
  getApplication: (id: string) => apiFetch<any>(`/admin/onboarding/applications/${id}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    apiFetch<any>(`/admin/onboarding/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),
  updateProgress: (id: string, progress: number) =>
    apiFetch<any>(`/admin/onboarding/applications/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    }),
  activate: (id: string, config: any) =>
    apiFetch<any>(`/admin/onboarding/applications/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  getStats: () => apiFetch<any>('/admin/onboarding/stats'),
};

// ─── Customers API ───────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params?: { search?: string; status?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiFetch<PagedResponse<any>>(`/admin/customers?${q}`);
  },
  getById: (id: string) => apiFetch<any>(`/admin/customers/${id}`),
  getStats: () => apiFetch<any>('/admin/customers/stats'),
  block: (id: string) => apiFetch<any>(`/admin/customers/${id}/block`, { method: 'PATCH' }),
  unblock: (id: string) => apiFetch<any>(`/admin/customers/${id}/unblock`, { method: 'PATCH' }),
};

// ─── Rides API ───────────────────────────────────────────────────────────────
export const ridesApi = {
  getAll: (params?: { search?: string; status?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiFetch<PagedResponse<any>>(`/admin/rides?${q}`);
  },
  getById: (id: string) => apiFetch<any>(`/admin/rides/${id}`),
  getStats: () => apiFetch<any>('/admin/rides/stats'),
  cancel: (id: string, reason: string) =>
    apiFetch<any>(`/admin/rides/${id}/cancel?reason=${encodeURIComponent(reason)}`, { method: 'PATCH' }),
  updateStatus: (id: string, status: string) =>
    apiFetch<any>(`/admin/rides/${id}/status?status=${status}`, { method: 'PATCH' }),
};

// ─── Payments API ────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: (params?: { status?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiFetch<PagedResponse<any>>(`/admin/payments?${q}`);
  },
  getById: (id: string) => apiFetch<any>(`/admin/payments/${id}`),
  getRevenue: () => apiFetch<any>('/admin/payments/revenue'),
  refund: (id: string, reason: string) =>
    apiFetch<any>(`/admin/payments/${id}/refund?reason=${encodeURIComponent(reason)}`, { method: 'POST' }),
};

// ─── Complaints API ──────────────────────────────────────────────────────────
export const complaintsApi = {
  getAll: (params?: { status?: string; type?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiFetch<PagedResponse<any>>(`/admin/complaints?${q}`);
  },
  getById: (id: string) => apiFetch<any>(`/admin/complaints/${id}`),
  getStats: () => apiFetch<any>('/admin/complaints/stats'),
  getSos: () => apiFetch<any[]>('/admin/complaints/sos'),
  resolve: (id: string, resolution: string) =>
    apiFetch<any>(`/admin/complaints/${id}/resolve?resolution=${encodeURIComponent(resolution)}`, { method: 'PATCH' }),
};

// ─── Notifications API ───────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (page = 0, size = 20) =>
    apiFetch<PagedResponse<any>>(`/admin/notifications?page=${page}&size=${size}`),
  send: (payload: { title: string; message: string; type: string; recipientType?: string; recipientIds?: string[] }) =>
    apiFetch<any>('/admin/notifications', { method: 'POST', body: JSON.stringify(payload) }),
  markRead: (id: string) =>
    apiFetch<any>(`/admin/notifications/${id}/read`, { method: 'PATCH' }),
};

// ─── Pricing API ─────────────────────────────────────────────────────────────
export const pricingApi = {
  getAll: () => apiFetch<any[]>('/super-admin/pricing'),
  create: (data: any) =>
    apiFetch<any>('/super-admin/pricing', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/super-admin/pricing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Cities API ──────────────────────────────────────────────────────────────
export const citiesApi = {
  getAll: (page = 0, size = 20) =>
    apiFetch<PagedResponse<any>>(`/super-admin/cities?page=${page}&size=${size}`),
  getActive: () => apiFetch<any[]>('/super-admin/cities/active'),
  create: (data: any) =>
    apiFetch<any>('/super-admin/cities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/super-admin/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id: string, active: boolean) =>
    apiFetch<any>(`/super-admin/cities/${id}/toggle?active=${active}`, { method: 'PATCH' }),
  delete: (id: string) =>
    apiFetch<any>(`/super-admin/cities/${id}`, { method: 'DELETE' }),
};

// ─── Roles API ───────────────────────────────────────────────────────────────
export const rolesApi = {
  getAll: () => apiFetch<any[]>('/super-admin/roles'),
  create: (data: any) =>
    apiFetch<any>('/super-admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/super-admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/super-admin/roles/${id}`, { method: 'DELETE' }),
};

// ─── Admins API ──────────────────────────────────────────────────────────────
export const adminsApi = {
  getAll: (params?: { search?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiFetch<PagedResponse<any>>(`/super-admin/admins?${q}`);
  },
  getById: (id: string) => apiFetch<any>(`/super-admin/admins/${id}`),
  create: (data: any) =>
    apiFetch<any>('/super-admin/admins', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/super-admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/super-admin/admins/${id}`, { method: 'DELETE' }),
  changeStatus: (id: string, status: string) =>
    apiFetch<any>(`/super-admin/admins/${id}/status?status=${status}`, { method: 'PATCH' }),
};

// ─── Audit Logs API ──────────────────────────────────────────────────────────
export const auditApi = {
  getAll: (page = 0, size = 20) =>
    apiFetch<PagedResponse<any>>(`/super-admin/audit?page=${page}&size=${size}`),
  getByModule: (module: string, page = 0, size = 20) =>
    apiFetch<PagedResponse<any>>(`/super-admin/audit/module/${module}?page=${page}&size=${size}`),
};

// ─── Settings API ────────────────────────────────────────────────────────────
export const settingsApi = {
  getAll: () => apiFetch<any[]>('/super-admin/settings'),
  getByCategory: (category: string) => apiFetch<any[]>(`/super-admin/settings/category/${category}`),
  update: (key: string, value: any, category = 'GENERAL', description = '') =>
    apiFetch<any>(`/super-admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, category, description }),
    }),
};
// ─── Driver Auth API ────────────────────────────────────────────────────────
export const driverAuthApi = {
  register: (payload: any) =>
    apiFetch<any>('/driver/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (phone: string) =>
    apiFetch<any>('/driver/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone: string, otp: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; driver: any }>(
      '/driver/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, otp }) }
    ),
};

// ─── Driver Profile API ─────────────────────────────────────────────────────
export const driverProfileApi = {
  getProfile: () => apiFetch<any>('/driver/api/profile'),
  updateStatus: (status: string) =>
    apiFetch<any>(`/driver/api/profile/status?status=${status}`, { method: 'PATCH' }),
  updateLocation: (latitude: number, longitude: number) =>
    apiFetch<any>('/driver/api/profile/location', {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude }),
    }),
  uploadDocument: (type: string, image: string) =>
    apiFetch<any>('/driver/api/profile/documents', {
      method: 'POST',
      body: JSON.stringify({ type, image }),
    }),
};

// ─── Driver Ride API ────────────────────────────────────────────────────────
export const driverRideApi = {
  getRequests: () => apiFetch<any[]>('/driver/api/rides/requests'),
  accept: (rideId: string) =>
    apiFetch<any>(`/driver/api/rides/${rideId}/accept`, { method: 'POST' }),
  updateStatus: (rideId: string, status: string) =>
    apiFetch<any>(`/driver/api/rides/${rideId}/status?status=${status}`, { method: 'PATCH' }),
  getActive: () => apiFetch<any>('/driver/api/rides/active'),
};

// ─── Driver Analytics API ───────────────────────────────────────────────────
export const driverAnalyticsApi = {
  getEarnings: () => apiFetch<any>('/driver/api/analytics/earnings'),
  getHistory: (page = 0, size = 10) =>
    apiFetch<PagedResponse<any>>(`/driver/api/analytics/history?page=${page}&size=${size}`),
};

// ─── Driver Safety API ──────────────────────────────────────────────────────
export const driverSafetyApi = {
  triggerSos: (location: { latitude: number; longitude: number }, rideId?: string) =>
    apiFetch<any>(`/driver/api/safety/sos${rideId ? `?rideId=${rideId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(location),
    }),
};
// ─── Customer Auth API ──────────────────────────────────────────────────────
export const customerAuthApi = {
  register: (payload: any) =>
    apiFetch<any>('/customer/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (phone: string) =>
    apiFetch<any>('/customer/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone: string, otp: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; customer: any }>(
      '/customer/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, otp }) }
    ),
};

// ─── Customer Profile API ───────────────────────────────────────────────────
export const customerProfileApi = {
  getProfile: () => apiFetch<any>('/customer/profile'),
  updateProfile: (payload: any) =>
    apiFetch<any>('/customer/profile', { method: 'PUT', body: JSON.stringify(payload) }),
};

// ─── Customer Ride API ──────────────────────────────────────────────────────
export const customerRideApi = {
  getEstimate: (pLat: number, pLng: number, dLat: number, dLng: number) =>
    apiFetch<any>(`/customer/rides/estimate?pickupLat=${pLat}&pickupLng=${pLng}&dropLat=${dLat}&dropLng=${dLng}`),
  book: (payload: any) =>
    apiFetch<any>('/customer/rides/book', { method: 'POST', body: JSON.stringify(payload) }),
  getActive: () => apiFetch<any>('/customer/rides/active'),
  cancel: (rideId: string) =>
    apiFetch<any>(`/customer/rides/${rideId}/cancel`, { method: 'POST' }),
};

// ─── Customer Wallet API ────────────────────────────────────────────────────
export const customerWalletApi = {
  getBalance: () => apiFetch<number>('/customer/wallet/balance'),
  addMoney: (amount: number) =>
    apiFetch<any>('/customer/wallet/add-money', { method: 'POST', body: JSON.stringify({ amount }) }),
  getTransactions: (page = 0, size = 10) =>
    apiFetch<PagedResponse<any>>(`/customer/wallet/transactions?page=${page}&size=${size}`),
};

// ─── Customer Saved Places API ──────────────────────────────────────────────
export const customerSavedPlacesApi = {
  getAll: () => apiFetch<any[]>('/customer/saved-places'),
  add: (payload: any) =>
    apiFetch<any>('/customer/saved-places', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (name: string) =>
    apiFetch<any>(`/customer/saved-places/${name}`, { method: 'DELETE' }),
};

// ─── Customer Notification API ──────────────────────────────────────────────
export const customerNotificationApi = {
  getAll: () => apiFetch<any[]>('/customer/notifications'),
  markRead: (id: string) =>
    apiFetch<any>(`/customer/notifications/${id}/read`, { method: 'PATCH' }),
};

// ─── Customer Safety API ────────────────────────────────────────────────────
export const customerSafetyApi = {
  triggerSos: (payload: { rideId?: string; latitude: number; longitude: number }) =>
    apiFetch<any>('/customer/safety/sos', { method: 'POST', body: JSON.stringify(payload) }),
};
