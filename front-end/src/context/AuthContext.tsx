'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import TokenService from '@/services/api/Tokenservice';

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    [key: string]: any;
}


interface AuthContextType {
    user: User | null;
    login: (user: any, rememberMe: boolean) => void;
    logout: () => void;
    updateUser: (user: any) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            try {
                const storedUser = TokenService.getUser();
                console.log(storedUser);
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

        const syncSessions = (event: StorageEvent) => {
            if (event.key === 'user') {
                const updatedUser = TokenService.getUser();
                console.log(updatedUser);
                setUser(updatedUser);
            }
        };

        window.addEventListener('storage', syncSessions);
        return () => window.removeEventListener('storage', syncSessions);
    }, []);

    const login = useCallback((userData: User, rememberMe: boolean) => {
        TokenService.setUser(userData, rememberMe);
        setUser(userData);
        console.log(user);
    }, []);

    const updateUser = useCallback((updatedData: Partial<User>) => {
        setUser((prevUser: User | null) => {
            if (!prevUser) return null;

            const updatedUser = { ...prevUser, ...updatedData };

            const isPersistent = !!localStorage.getItem('user');
            TokenService.setUser(updatedUser, isPersistent);

            return updatedUser;
        });
    }, []);

    const logout = useCallback(() => {
        TokenService.removeUser();
        setUser(null);
        console.log(user);
    }, []);

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