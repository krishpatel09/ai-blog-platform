import Cookies from 'js-cookie';

class TokenService {
    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    private getStorage(): Storage {
        if (!this.isBrowser()) return {} as Storage;
        return localStorage.getItem("user") ? localStorage : sessionStorage;
    }

    getLocalRefreshToken() {
        const user = this.getUser();
        return user?.refreshToken;
    }

    getLocalAccessToken() {
        const user = this.getUser();
        return user?.accessToken;
    }

    updateLocalAccessToken(token: string) {
        const storage = this.getStorage();
        const user = this.getUser();
        if (user) {
            user.accessToken = token;
            storage.setItem("user", JSON.stringify(user));

            const isRememberMe = !!localStorage.getItem("user");
            Cookies.set('accessToken', token, {
                expires: isRememberMe ? 30 : undefined,
                path: '/'
            });
        }
    }

    getUser() {
        if (!this.isBrowser()) return null;
        const storage = this.getStorage();
        const userStr = storage.getItem("user");
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    }


    setUser(user: any, rememberMe: boolean = false) {
        if (!this.isBrowser()) return;

        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        storage.setItem("user", JSON.stringify(user));
        otherStorage.removeItem("user");

        const token = user.accessToken;
        if (token) {
            Cookies.set('accessToken', token, {
                expires: rememberMe ? 30 : undefined,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            // મિડલવેરના સરળ ચેક માટે 'user' કુકી
            Cookies.set('user', 'true', {
                expires: rememberMe ? 30 : undefined,
                path: '/'
            });
        }
    }

    removeUser() {
        if (!this.isBrowser()) return;
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        Cookies.remove("accessToken", { path: '/' });
        Cookies.remove("user", { path: '/' });
    }
}

export default new TokenService();
