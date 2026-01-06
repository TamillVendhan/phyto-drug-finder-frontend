  import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
  import { authAPI } from '../api/api';
  import { toast } from 'react-toastify';

  const AuthContext = createContext(null);

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on mount
const checkAuth = useCallback(async () => {
  setLoading(true);
  try {
    const response = await authAPI.check();
    if (response.authenticated && response.user) {
      const userData = response.user;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('phyto_user', JSON.stringify(userData));
    } else {
      // Clear state directly instead of calling logout()
      localStorage.removeItem('phyto_user');
      setUser(null);
      setIsAuthenticated(false);
    }
  } catch (error) {
    console.warn('Session invalid or expired:', error);
    localStorage.removeItem('phyto_user');
    setUser(null);
    setIsAuthenticated(false);
  } finally {
    setLoading(false);
  }
}, []); // ✅ No dependencies needed


    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });

      if (response.success) {

        const userData = response.user;

        localStorage.setItem('phyto_user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${userData.name}!`);

        return { success: true, user: userData };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

    // Register function
    const register = async (userData) => {
      try {
        setLoading(true);
        const response = await authAPI.register(userData);
        
        if (response && response.id !== undefined) {
          toast.success('Registration successful! Please login.');
          return { success: true };
        } else {
          toast.error(response?.message || 'Registration failed');
          return { success: false, message: response?.message };
        }
      } catch (error) {
        const message = error?.message || 'Registration failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    };

    // Logout function
    const logout = async () => {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('phyto_user');
        setUser(null);
        setIsAuthenticated(false);
        toast.info('You have been logged out');
      }
    };

    // Update profile function
    const updateProfile = async (profileData) => {
      try {
        const response = await authAPI.updateProfile(profileData);
        
        if (response.data.success) {
          const updatedUser = { ...user, ...profileData };
          setUser(updatedUser);
          localStorage.setItem('phyto_user', JSON.stringify(updatedUser));
          toast.success('Profile updated successfully!');
          return { success: true };
        } else {
          toast.error(response.data.message || 'Update failed');
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Update failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    };

    // Change password function
    const changePassword = async (currentPassword, newPassword) => {
      try {
        const response = await authAPI.changePassword({
          current_password: currentPassword,
          new_password: newPassword
        });
        
        if (response.data.success) {
          toast.success('Password changed successfully!');
          return { success: true };
        } else {
          toast.error(response.data.message || 'Password change failed');
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Password change failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    };

    // Check if user has specific role
    const hasRole = (role) => {
      if (!user) return false;
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      return user.role === role;
    };

    // Check if user is admin
    const isAdmin = () => hasRole('admin');

    // Check if user is moderator or higher
    const isModerator = () => hasRole(['admin', 'moderator']);

    const value = {
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      hasRole,
      isAdmin,
      isModerator,
      checkAuth,
    };

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };

  export default AuthContext;