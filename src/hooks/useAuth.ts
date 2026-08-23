import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Admin } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: admin, isLoading, isError } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data } = await api.get('/admin/me');
      return data.data.admin as Admin;
    },
    enabled: location.pathname !== '/admin/login',
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/admin/login', credentials);
      if (data.data.token) {
        sessionStorage.setItem('admin_token', data.data.token);
      }
      return data.data.admin as Admin;
    },
    onSuccess: (admin) => {
      queryClient.setQueryData(['auth'], admin);
      navigate('/admin/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/logout');
      sessionStorage.removeItem('admin_token');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth'], null);
      navigate('/admin/login');
    },
  });

  return {
    admin,
    isAuthenticated: !!admin && !isError,
    isLoading,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
