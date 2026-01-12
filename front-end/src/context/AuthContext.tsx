'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import TokenService, { User } from '@/services/api/Tokenservice';

// REFACTOR: Import User interface from TokenService for type consistency across the app
// This ensures AuthContext and TokenService use the same type definition


interface AuthContextType {
    user: User | null;
    login: (user: any, token: string) => void;
    logout: () => void;
    updateUser: (user: any) => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // REFACTOR: Use strict User type instead of 'any' for type safety
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // REFACTOR: Initialize auth state from localStorage on mount
    // This restores user session after page refresh
    useEffect(() => {
        const initAuth = () => {
            try {
                const storedUser = TokenService.getUser();
                if (storedUser) {
                    setUser(storedUser);
                }

            } catch (error) {
                console.error("Failed to load user session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // REFACTOR: Cross-tab session synchronization
        // When user logs out in one tab, all other tabs automatically update
        const syncSessions = (event: StorageEvent) => {
            if (event.key === 'user') {
                const updatedUser = TokenService.getUser();
                setUser(updatedUser);
            }
        };

        window.addEventListener('storage', syncSessions);
        return () => window.removeEventListener('storage', syncSessions);
    }, []);

    /**
     * Login function - CRITICAL DATA FLOW
     * 
     * REFACTOR: useCallback prevents function recreation on every render
     * This is essential because login is passed to child components via context
     * Without useCallback, child components would re-render unnecessarily
     * 
     * FIX: Correct execution order to prevent race conditions:
     * 1. Store in localStorage FIRST (TokenService.setUser)
     * 2. Update React state SECOND (setUser)
     * 3. Router redirect happens AFTER in the calling component
     * 
     * This ensures middleware can detect authentication immediately
     */
    const login = useCallback((user: User, token: string) => {
        // FIX: Validate parameters to prevent silent failures
        if (!user || !token) {
            console.error('[AuthContext] login() called with invalid parameters');
            return;
        }

        // REFACTOR: Storage update BEFORE state update ensures consistency
        TokenService.setUser(user, token);
        setUser(user);
    }, []);

    /**
     * Update user profile
     * 
     * REFACTOR: useCallback prevents function recreation
     * Allows partial updates to user profile (e.g., just name or avatar)
     */
    const updateUser = useCallback((updatedData: Partial<User>) => {
        setUser((prevUser: User | null) => {
            if (!prevUser) return null;

            const updatedUser = { ...prevUser, ...updatedData };
            // REFACTOR: Keep localStorage in sync with React state
            TokenService.updateUser(updatedUser);
            return updatedUser;
        });
    }, []);

    /**
     * Logout function
     * 
     * REFACTOR: useCallback prevents function recreation
     * Clears localStorage and React state
     * Note: RefreshToken cookie is cleared by backend API call
     */
    const logout = useCallback(() => {
        TokenService.removeUser();
        setUser(null);
    }, []);

    /**
     * REFACTOR: useMemo prevents context value object recreation on every render
     * Without useMemo, a new object is created each render, causing ALL consumers to re-render
     * With useMemo, object only recreates when dependencies change
     * 
     * This is critical for performance in large apps with many components consuming AuthContext
     */
    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        updateUser,
        isLoading,
        isAuthenticated: !!user,
    }), [user, isLoading, login, logout, updateUser]);


    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};