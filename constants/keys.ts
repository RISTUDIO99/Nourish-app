// AsyncStorage keys shared across the app
export const WELCOME_SEEN_KEY = "nourish:welcome:seen:v1";
export const DEV_MODE_KEY = "nourish:dev:unlocked:v1";
export const DISCLAIMER_KEY = "nourish:disclaimer:accepted:v1";
// v2 key — shows "Before you begin" to ALL users once after the v1.1 update,
// including users who already accepted the old disclaimer modal.
export const BEFORE_YOU_BEGIN_KEY = "nourish:consent:v2";
// Auth session token stored securely
export const AUTH_TOKEN_KEY = "nourish:auth:token:v1";
export const AUTH_USER_KEY = "nourish:auth:user:v1";
