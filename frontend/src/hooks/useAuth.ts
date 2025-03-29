import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction 
} from '../features/auth/authSlice';
import { authService } from '../services/auth.service';
import { LoginCredentials, RegisterData } from '../types/auth';

export const useAuth = () => {
  const dispatch = useDispatch();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      dispatch(loginStart());
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data.user));
    },
    onError: (error: any) => {
      dispatch(loginFailure(error.response?.data?.detail || 'Login failed'));
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => {
      dispatch(loginStart());
      return authService.register(userData);
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data.user));
    },
    onError: (error: any) => {
      dispatch(loginFailure(error.response?.data?.detail || 'Registration failed'));
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      dispatch(logoutAction());
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    isRegistering: registerMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}; 