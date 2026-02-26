/**
 * API Service
 * Centralized API calls for the NFT Greenhouse Management System
 */

import api from '../lib/axios';

// ========================
// Auth API
// ========================

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ========================
// Sensor API
// ========================

export const sensorApi = {
  getLatest: async () => {
    const response = await api.get('/api/sensor/latest');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/api/sensor/history', { params });
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await api.get('/api/sensor/stats', { params });
    return response.data;
  },

  createManual: async (data) => {
    const response = await api.post('/api/sensor/manual', data);
    return response.data;
  },
};

// ========================
// Talang API
// ========================

export const talangApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/talang', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/talang/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/talang', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/api/talang/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/talang/${id}`);
    return response.data;
  },
};

// ========================
// Batch API
// ========================

export const batchApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/batch', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/batch/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/batch', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/api/batch/${id}`, data);
    return response.data;
  },

  updateStage: async (id, stage, notes) => {
    const response = await api.patch(`/api/batch/${id}/stage`, { stage, notes });
    return response.data;
  },

  getConfig: async (stage) => {
    const response = await api.get(`/api/batch/config/${stage}`);
    return response.data;
  },

  getAllConfigs: async () => {
    const response = await api.get('/api/batch/config/all');
    return response.data;
  },
};

// ========================
// Harvest API
// ========================

export const harvestApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/harvest', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/harvest/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/harvest', data);
    return response.data;
  },

  markAsSold: async (id, data) => {
    const response = await api.patch(`/api/harvest/${id}/sell`, data);
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await api.get('/api/harvest/stats', { params });
    return response.data;
  },
};

// ========================
// Alert API
// ========================

export const alertApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/alert', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/alert/${id}`);
    return response.data;
  },

  resolve: async (id, notes) => {
    const response = await api.patch(`/api/alert/${id}/resolve`, { notes });
    return response.data;
  },

  getConfig: async (stage) => {
    const response = await api.get('/api/alert/config', {
      params: stage ? { stage } : {},
    });
    return response.data;
  },

  updateConfig: async (data) => {
    const response = await api.put('/api/alert/config', data);
    return response.data;
  },

  getCount: async () => {
    const response = await api.get('/api/alert/count');
    return response.data;
  },
};
