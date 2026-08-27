// API base URL — update this when the app is deployed to production
export const API_BASE_URL = "https://f12a35e0-7774-4be1-a2c8-0ecc70ec8cc7-00-272yp5ov63ztq.janeway.replit.dev";

export const api = {
  magicLink: `${API_BASE_URL}/api/auth/magic-link`,
  verify: `${API_BASE_URL}/api/auth/verify`,
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  me: `${API_BASE_URL}/api/auth/me`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  audioTracks: `${API_BASE_URL}/api/audio/tracks`,
  cookbookRecipes: `${API_BASE_URL}/api/cookbook/recipes`,
  nutritionLog: `${API_BASE_URL}/api/nutrition/log`,
};
