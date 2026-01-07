class TokenService {
    getLocalRefreshToken() {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        return user?.refreshToken;
    }

    getLocalAccessToken() {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        return user?.accessToken;
    }

    updateLocalAccessToken(token: string) {
        const userStr = localStorage.getItem("user");
        let user = userStr ? JSON.parse(userStr) : null;
        if (user) {
            user.accessToken = token;
            localStorage.setItem("user", JSON.stringify(user));
        }
    }

    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    }

    setUser(user: any) {
        console.log(JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
    }

    removeUser() {
        localStorage.removeItem("user");
    }
}

export default new TokenService();
