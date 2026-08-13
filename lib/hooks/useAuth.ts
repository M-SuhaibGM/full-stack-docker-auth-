import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Get current user
  const {
    data: user,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
  
    queryFn: () => authApi.getCurrentUser(),

    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Don't run on mount, we'll trigger manually
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginCredentials) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      toast.success('Welcome back!', {
        description: 'Logged in successfully',
      });
      refetchUser();
      router.push('/dashboard');
    },
    onError: (error: any) => {
      // Handle both 'msg' and 'message' formats
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.msg ||
        'Invalid credentials';

      toast.error('Login failed', {
        description: errorMessage,
      });
    },
  });


  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterCredentials) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      toast.success('Account created!', {
        description: 'Welcome to our platform',
      });
      refetchUser();
      router.push('/dashboard');
    },
    onError: (error: any) => {
      // Handle both 'msg' and 'message' formats
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.msg ||
        'Invalid credentials';

      toast.error('Registration failed', {
        description: errorMessage,
      });
    },
  });

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
      queryClient.clear();
      localStorage.removeItem('accessToken');
      toast.success('Logged out', {
        description: 'See you next time!',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error', {
        description: 'Failed to logout',
      });
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refetchUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    logout,
    refetchUser,
  };
}