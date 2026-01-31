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
    GET_PROFILE: "/api/users/me",
    FORGOT_PASSWORD: "/api/users/forgot-password",
    RESET_PASSWORD: "/api/users/reset-password",
    GET_PUBLIC_PROFILE: "/api/users/@",
  },
  TAGS: {
    CREATE: "/api/tags",
    GET_ALL: "/api/tags",
  },
  BLOG: {
    CREATE: "/api/blog/create",
    GET_BY_SLUG: "/api/blog",
    GET_LIVE: "/api/blog/live",
    GET_MY_POSTS: "/api/blog/my-posts",
    GET_USER_POSTS: "/api/blog/user/@",
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
    GET_USER_LISTS: "/api/bookmarks/user/@",
    GET_LIST_DETAILS: "/api/bookmarks/get-list-details",
    ADD_ITEM: "/api/bookmarks/add-item",
    REMOVE_ITEM: "/api/bookmarks/remove-item",
  },
  FOLLOW: {
    FOLLOW: "/api/users/follow",
    IS_FOLLOWING: "/api/users/is-following",
    GET_STATS: "/api/users/profile/",
    GET_FOLLOWERS: "/api/users/followers/",
    GET_FOLLOWING: "/api/users/following/",
  },
  COMMENTS: {
    CREATE: "/api/comments/create",
    GET_POST_COMMENTS: "/api/comments/post/",
    GET_REPLIES: "/api/comments/replies/",
    DELETE: "/api/comments/delete/",
    LIKE: "/api/comments/like/",
  },
  STORIES: {
    GET_LIST: "/api/stories",
    GET_STATS: "/api/stories/stats",
    IMPORT: "/api/stories/import",
  },
  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    MARK_READ: "/api/notifications/read", // :id/read handled in service
    MARK_ALL_READ: "/api/notifications/read-all",
    DELETE: "/api/notifications", // :id handled in service
  },
};
