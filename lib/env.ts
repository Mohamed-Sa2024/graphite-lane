/**
 * Mock mode is on when no GitHub OAuth app is configured, or when explicitly
 * forced. This lets the app render real-looking data with zero setup, while
 * keeping the "no database / no persistence" guarantee — fixtures are static.
 */
export const isMockMode =
  process.env.MOCK_DATA === "true" || !process.env.AUTH_GITHUB_ID;
