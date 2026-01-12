// REFACTOR: Strict TypeScript interface for User data stored in localStorage
// This ensures type safety across the application and prevents runtime errors
export interface User {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    [key: string]: any; // Allow additional properties for extensibility
}

/**
 * TokenService - Production-grade token and user data management
 * 
 * SECURITY STRATEGY:
 * - AccessToken: Stored in localStorage for client-side API requests
 * - User Profile: Stored in localStorage (non-sensitive data only)
 * - RefreshToken: Stored in HttpOnly cookies (managed by backend, NOT accessible via JS)
 * 
 * WHY LOCALSTORAGE?
 * - Persists across browser tabs and sessions
 * - Accessible to axios interceptors for Authorization headers
 * - Safe for non-sensitive data (never store passwords or refresh tokens here)
 * 
 * WHY NOT SESSIONSTORAGE?
 * - Does not persist across tabs, breaking multi-tab user experience
 * - Would require users to re-authenticate in every new tab
 */
class TokenService {
    /**
     * Check if code is running in browser environment (not SSR)
     * REFACTOR: Required for Next.js SSR compatibility
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Store user profile and access token in localStorage
     * 
     * @param user - User profile object (non-sensitive data)
     * @param accessToken - JWT access token for API authentication
     * 
     * REFACTOR: This method is called ONLY after successful authentication
     * Data flow: Backend response → TokenService.setUser() → AuthContext.setUser() → Router redirect
     */
    setUser(user: User, accessToken: string): void {
        if (!this.isBrowser()) return;

        // REFACTOR: Store in localStorage for persistence across browser tabs
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
    }

    /**
     * Retrieve user profile from localStorage
     * 
     * @returns User object or null if not authenticated
     * 
     * REFACTOR: Safe JSON parsing with error handling to prevent app crashes
     */
    getUser(): User | null {
        if (!this.isBrowser()) return null;

        const data = localStorage.getItem("user");

        try {
            return data ? JSON.parse(data) : null;
        } catch (error) {
            // FIX: Log parsing errors for debugging without crashing the app
            console.error('[TokenService] Failed to parse user data from localStorage:', error);
            return null;
        }
    }

    /**
     * Update user profile in localStorage
     * 
     * @param user - Updated user profile object
     * 
     * REFACTOR: Used when user updates profile settings (name, avatar, etc.)
     * Keeps localStorage in sync with backend state
     */
    updateUser(user: User): void {
        if (!this.isBrowser()) return;
        localStorage.setItem("user", JSON.stringify(user));
    }

    /**
     * Retrieve access token from localStorage
     * 
     * @returns Access token string or null
     * 
     * REFACTOR: Used by axios interceptor to attach Authorization header
     */
    getLocalAccessToken(): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem("token");
    }

    /**
     * Update access token in localStorage
     * 
     * @param newToken - New access token from refresh token flow
     * 
     * REFACTOR: Called by axios interceptor after successful token refresh
     * Ensures subsequent requests use the new token
     */
    updateLocalAccessToken(newToken: string): void {
        if (this.isBrowser()) {
            localStorage.setItem("token", newToken);
        }
    }

    /**
     * Clear all authentication data from localStorage
     * 
     * REFACTOR: Called on logout to ensure complete session cleanup
     * Note: RefreshToken cookie is cleared by backend via res.clearCookie()
     */
    removeUser(): void {
        if (!this.isBrowser()) return;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
}

// REFACTOR: Export singleton instance to ensure consistent state across the app
export default new TokenService();
