// Dynamic server URL resolution for web vs native mobile (Capacitor)
export function getDefaultServerUrl() {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return 'http://10.150.152.80:5000';
  }
  return '';
}

export function getServerUrl() {
  return localStorage.getItem('fleet_server_url') || getDefaultServerUrl();
}

export function setServerUrl(url) {
  if (!url) {
    localStorage.removeItem('fleet_server_url');
  } else {
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem('fleet_server_url', cleaned);
  }
}

export function getFileUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const server = getServerUrl();
  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return server ? `${server}${normalized}` : normalized;
}

function getApiBase() {
  const server = getServerUrl();
  return server ? `${server}/api` : '/api';
}

function getAuthHeader() {
  const token = localStorage.getItem('fleet_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  // If body is FormData, don't set Content-Type so browser can set boundary automatically
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${getApiBase()}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      localStorage.removeItem('fleet_token');
      localStorage.removeItem('fleet_user');
    }
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      localStorage.setItem('fleet_token', res.token);
      localStorage.setItem('fleet_user', JSON.stringify(res.user));
    }
    return res;
  },

  async register(data) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) {
      localStorage.setItem('fleet_token', res.token);
      localStorage.setItem('fleet_user', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe() {
    return request('/auth/me');
  },

  logout() {
    localStorage.removeItem('fleet_token');
    localStorage.removeItem('fleet_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('fleet_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Stats
  async getStats() {
    return request('/stats');
  },

  // Vehicles
  async getVehicles() {
    return request('/vehicles');
  },

  async getVehicle(id) {
    return request(`/vehicles/${id}`);
  },

  async addVehicle(vehicleData) {
    return request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },

  async updateVehicle(id, vehicleData) {
    return request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  },

  async deleteVehicle(id) {
    return request(`/vehicles/${id}`, {
      method: 'DELETE'
    });
  },

  async uploadVehiclePhotos(vehicleId, formData) {
    return request(`/vehicles/${vehicleId}/photos`, {
      method: 'POST',
      body: formData
    });
  },

  async deleteVehiclePhoto(vehicleId, photoId) {
    return request(`/vehicles/${vehicleId}/photos/${photoId}`, {
      method: 'DELETE'
    });
  },

  // Documents
  async getDocuments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/documents${query ? '?' + query : ''}`);
  },

  async getDocument(id) {
    return request(`/documents/${id}`);
  },

  async addDocument(formData) {
    return request('/documents', {
      method: 'POST',
      body: formData
    });
  },

  async updateDocument(id, formData) {
    return request(`/documents/${id}`, {
      method: 'PUT',
      body: formData
    });
  },

  async deleteDocument(id) {
    return request(`/documents/${id}`, {
      method: 'DELETE'
    });
  },

  // Drivers
  async getDrivers() {
    return request('/drivers');
  },

  async getDriver(id) {
    return request(`/drivers/${id}`);
  },

  async addDriver(driverData) {
    return request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },

  async updateDriver(id, driverData) {
    return request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },

  async deleteDriver(id) {
    return request(`/drivers/${id}`, {
      method: 'DELETE'
    });
  },

  // Maintenance
  async getMaintenance(vehicleId = null) {
    const query = vehicleId ? `?vehicle_id=${vehicleId}` : '';
    return request(`/maintenance${query}`);
  },

  async addMaintenance(maintenanceData) {
    return request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
  },

  async updateMaintenance(id, maintenanceData) {
    return request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData)
    });
  },

  async deleteMaintenance(id) {
    return request(`/maintenance/${id}`, {
      method: 'DELETE'
    });
  },

  // Expenses
  async getExpenses(vehicleId = null) {
    const query = vehicleId ? `?vehicle_id=${vehicleId}` : '';
    return request(`/expenses${query}`);
  },

  async addExpense(expenseData) {
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  },

  async deleteExpense(id) {
    return request(`/expenses/${id}`, {
      method: 'DELETE'
    });
  },

  // Notifications
  async getNotifications() {
    return request('/notifications');
  },

  async markNotificationRead(id) {
    return request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  async markAllNotificationsRead() {
    return request('/notifications/read-all', {
      method: 'PUT'
    });
  },

  // Search
  async search(query) {
    return request(`/search?q=${encodeURIComponent(query)}`);
  },

  // Reset Demo Data
  async resetDemoData() {
    return request('/demo/reset', {
      method: 'POST'
    });
  },

  // Mobile / Server connection helpers
  getServerUrl,
  setServerUrl,
  getFileUrl,
  async testServerConnection(url) {
    const target = url ? url.trim().replace(/\/+$/, '') : getServerUrl();
    const endpoint = target ? `${target}/api/stats` : '/api/stats';
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeader()
    });
    return res.ok;
  }
};
