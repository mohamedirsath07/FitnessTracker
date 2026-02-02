/**
 * ============================================
 * AUTHENTICATION CONTEXT
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * WHAT IS CONTEXT?
 * React Context provides a way to share values (like user data)
 * between components without passing props manually at every level.
 * 
 * Think of it like a "global state" that any component can access.
 * 
 * WHY USE CONTEXT FOR AUTH?
 * - User data needed in many components (header, profile, etc.)
 * - Login/logout functions need to be accessible everywhere
 * - Avoid "prop drilling" (passing props through many levels)
 * 
 * HOW CONTEXT WORKS:
 * 1. Create Context with createContext()
 * 2. Create Provider component that wraps the app
 * 3. Use useContext() hook to access values in any component
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Wraps the entire app and provides auth state to all children.
 * Any component inside AuthProvider can access auth data.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Check if user is already logged in on app load
     * 
     * useEffect runs after component mounts.
     * Empty dependency array [] means it runs only once.
     */
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    // Verify token and get user data
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                } catch (err) {
                    // Token invalid - clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Register a new user
     */
    const register = async (userData) => {
        try {
            setError(null);
            console.log('Attempting registration with:', { ...userData, password: '***' });
            const response = await authAPI.register(userData);
            console.log('Registration successful:', response.data);

            // Store token and user
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);

            return { success: true };
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);

            // Get detailed error message
            let message = 'Registration failed';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.response?.data?.errors) {
                // Handle validation errors
                message = err.response.data.errors.map(e => e.msg).join(', ');
            } else if (err.message) {
                message = err.message;
            }

            setError(message);
            return { success: false, error: message };
        }
    };

    /**
     * Login user
     */
    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);

            // Store token and user
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    /**
     * Update user data (after profile changes)
     */
    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Value object passed to context consumers
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Hook
 * 
 * Custom hook to easily access auth context.
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
