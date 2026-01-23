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
    CREATE: "/api/blog/create",
    GET_BY_SLUG: "/api/blog",
    GET_LIVE: "/api/blog/live",
  },
  IMAGEKIT: {
    AUTH: "/api/imagekit/auth",
  },
  AI: {
    GENERATE_FROM_IMAGE: "/api/ai/generate-from-image",
  },
  BOOKMARK: {
    CREATE_LIST: "/api/bookmarks/create-list",
    GET_LISTS: "/api/bookmarks/get-lists",
    GET_LIST_DETAILS: "/api/bookmarks/get-list-details",
    ADD_ITEM: "/api/bookmarks/add-item",
    REMOVE_ITEM: "/api/bookmarks/remove-item",
  },
};
