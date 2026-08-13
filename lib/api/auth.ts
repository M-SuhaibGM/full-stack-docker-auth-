import { apiClient } from './client';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from '@/types/auth';

export const authApi = {
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/user/register', data);
    return response.data;
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/user/login', data);
    return response.data;
  },

  googleLogin: () => {
    // Redirect to Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/user/google`;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/user/forgot_password', data);
    return response.data;
  },

  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/user/update-password/${token}`, data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/user/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/user/logout');
    localStorage.removeItem('accessToken');
  },
};