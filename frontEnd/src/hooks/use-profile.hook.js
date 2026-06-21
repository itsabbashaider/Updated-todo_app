import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect, useState } from 'react';
import { getCurrentUser, updateProfile as updateProfileService, changePassword as changePasswordService } from '../services/auth.service';
import { getErrorMessage } from '../utils/error-handler.util';

const extractUser = (response) => {
  if (!response) return null;
  const data = response.data;

  if (data && typeof data === 'object') {
    if (data.data && typeof data.data === 'object' && (data.data.email || data.data.id)) {
      return data.data;
    }
    if (data.email || data.id || data.firstName) {
      return data;
    }
  }

  return data ?? null;
};

/**
 * TanStack Query version of useProfile
 * Fetches the current user profile
 */
export const useProfile = () => {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return extractUser(response);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const mutate = async () => {
    await refetch();
  };

  return {
    user: user || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    mutate,
  };
};

/**
 * Hook to handle profile updates with TanStack Query
 * Automatically invalidates and refetches the currentUser query on success
 * Manages message display internally with auto-clear after 4 seconds
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const messageTimeoutRef = useRef(null);
  const [message, setMessage] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async (profileData) => {
      const { firstName, lastName, email } = profileData;
      return await updateProfileService(firstName, lastName, email);
    },
    onSuccess: () => {
      // Clear any previous timeout
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      
      // Set success message
      setMessage('Changes saved successfully');
      
      // Invalidate and refetch the user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Auto-clear message after 4 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 4000);
    },
    onError: (error) => {
      // Clear any previous timeout
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      
      // Set error message
      const errorMsg = getErrorMessage(error);
      setMessage(`Error: ${errorMsg}`);
      
      // Auto-clear message after 4 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 4000);
    },
    retry: 1,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  return {
    updateProfile: mutate,
    isLoading: isPending,
    message,
  };
};

/**
 * Hook to handle password changes with TanStack Query
 * Manages loading, success, and error states with auto-clearing messages
 */
export const useChangePassword = () => {
  const messageTimeoutRef = useRef(null);
  const [message, setMessage] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async (passwordData) => {
      const { currentPassword, newPassword } = passwordData;
      return await changePasswordService(currentPassword, newPassword);
    },
    onSuccess: () => {
      // Clear any previous timeout
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      
      // Set success message
      setMessage('Password changed successfully');
      
      // Auto-clear message after 4 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 4000);
    },
    onError: (error) => {
      // Clear any previous timeout
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      
      // Set error message
      const errorMsg = getErrorMessage(error);
      setMessage(`Error: ${errorMsg}`);
      
      // Auto-clear message after 4 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 4000);
    },
    retry: 1,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  return {
    changePassword: mutate,
    isLoading: isPending,
    message,
  };
};