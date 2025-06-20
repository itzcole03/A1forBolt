import apiService from './api';
import { User } from '@/types';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiService.login(email, password);
      const { token } = response.data;

      // Store token
      localStorage.setItem('auth_token', token);

      // Get user profile
      const userProfile = await apiService.getUserProfile();
      this.currentUser = userProfile.data;

      // Store user in localStorage
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));

      return this.currentUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: { email: string; password: string; name: string }): Promise<User> {
    try {
      const response = await apiService.register(userData);
      const { token } = response.data;

      // Store token
      localStorage.setItem('auth_token', token);

      // Get user profile
      const userProfile = await apiService.getUserProfile();
      this.currentUser = userProfile.data;

      // Store user in localStorage
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));

      return this.currentUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUser = null;
    window.location.href = '/login';
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.updateUserProfile(profileData);
      this.currentUser = response.data;
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
      return this.currentUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
