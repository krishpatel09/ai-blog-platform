export const API_PATH = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESEND_EMAIL_VERIFICATION: "/api/auth/resend-verification",
    LOGIN: "/api/auth/signin",
    LOGOUT: "/api/auth/logout",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    CLERK_VERIFY: "/api/auth/clerk-verify",
  },
  USERS: {
    FORGOT_PASSWORD: "/api/users/forgot-password",
    RESET_PASSWORD: "/api/users/reset-password",
  },
  TAGS: {
    CREATE: "/api/tags",
    GET_ALL: "/api/tags",
  },
  BLOG: {
    CREATE: "/api/blog",
    GET_BY_SLUG: "/api/blog",
    GET_ALL: "/api/blog",
  },
  IMAGEKIT: {
    AUTH: "/api/imagekit/auth",
  },
};
