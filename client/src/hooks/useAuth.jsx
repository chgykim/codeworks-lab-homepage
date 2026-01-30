import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithGoogle,
    firebaseSignOut,
    onAuthStateChange,
    ADMIN_EMAIL
} from '../config/firebase';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const checkSession = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('authToken');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        // Firebase auth state listener
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            if (!firebaseUser) {
                // Only clear if no local token
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setUser(null);
                }
            }
            // Don't auto-set user from Firebase - wait for server verification
            if (loading) {
                checkSession();
            }
        });

        // Initial check
        checkSession();

        return () => unsubscribe();
    }, []);

    // Google login
    const loginWithGoogle = async () => {
        const result = await signInWithGoogle();

        if (!result.success) {
            throw new Error(result.error);
        }

        // Verify with server and get session token
        try {
            const response = await api.post('/auth/firebase-login', {
                idToken: result.idToken
            });

            const { user: serverUser, token } = response.data;

            // Store server-issued token
            localStorage.setItem('authToken', token);
            setUser(serverUser);

            return serverUser;
        } catch (error) {
            // Sign out from Firebase if server verification fails
            await firebaseSignOut();
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await api.post('/auth/logout');
            await firebaseSignOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
        }
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        logout,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default useAuth;
