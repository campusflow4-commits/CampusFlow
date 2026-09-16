const API_BASE = 'http://localhost:5000/api';

// Generate or retrieve persistent local device ID for Feature 26 (One device -> One account)
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('skillswap_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    localStorage.setItem('skillswap_device_id', deviceId);
  }
  return deviceId;
};

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('skillswap_token');
  const deviceId = getDeviceId();

  const headers = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId,
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Feature 26: Session Mismatch (Logged in elsewhere)
      if (response.status === 403 && data.code === 'DEVICE_MISMATCH') {
        window.dispatchEvent(new CustomEvent('skillswap:device_mismatch', { detail: data.message }));
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  uploadAvatar: async (formData) => {
    const token = localStorage.getItem('skillswap_token');
    const response = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'POST',
      headers: {
        'x-device-id': getDeviceId(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
  uploadFile: async (endpoint, formData) => {
    const token = localStorage.getItem('skillswap_token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'x-device-id': getDeviceId(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }
};
