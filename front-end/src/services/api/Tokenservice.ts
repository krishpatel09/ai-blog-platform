export interface User {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    [key: string]: any; // Allow additional properties for extensibility
}


class TokenService {

    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }


    setUser(user: User, accessToken: string): void {
        if (!this.isBrowser()) return;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
    }


    getUser(): User | null {
        if (!this.isBrowser()) return null;

        const data = localStorage.getItem("user");

        try {
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('[TokenService] Failed to parse user data from localStorage:', error);
            return null;
        }
    }


    updateUser(user: User): void {
        if (!this.isBrowser()) return;
        localStorage.setItem("user", JSON.stringify(user));
    }


    getLocalAccessToken(): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem("token");
    }


    updateLocalAccessToken(newToken: string): void {
        if (this.isBrowser()) {
            localStorage.setItem("token", newToken);
        }
    }


    removeUser(): void {
        if (!this.isBrowser()) return;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
}

export default new TokenService();
