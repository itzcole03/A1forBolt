import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  lastLogin: string;
}

export interface SystemLog {
  id: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeSessions: number;
  totalPredictions: number;
  uptime: string;
}

class AdminService {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return response.data;
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
    await api.patch(`/admin/users/${userId}/status`, { status });
  }

  async getLogs(): Promise<SystemLog[]> {
    const response = await api.get('/admin/logs');
    return response.data;
  }

  async getMetrics(): Promise<SystemMetrics> {
    const response = await api.get('/admin/metrics');
    return response.data;
  }

  async updateSystemSettings(settings: {
    maintenanceMode: boolean;
    logLevel: string;
    backupSchedule: string;
  }): Promise<void> {
    await api.post('/admin/settings', settings);
  }

  async refreshCache(): Promise<void> {
    await api.post('/admin/cache/refresh');
  }

  async backupDatabase(): Promise<void> {
    await api.post('/admin/database/backup');
  }
}

export const adminService = new AdminService();
