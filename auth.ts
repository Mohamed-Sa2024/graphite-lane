import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Only register the provider when an OAuth app is configured. Without it the
// app runs in mock mode and these routes stay dormant.
const providers = process.env.AUTH_GITHUB_ID
  ? [
      GitHub({
        authorization: { params: { scope: "read:user repo" } },
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  // Required for self-hosted / proxied deployments (Vercel, Docker, etc.).
  // Can also be set via AUTH_TRUST_HOST=true.
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      (session as { accessToken?: string }).accessToken =
        token.accessToken as string | undefined;
      return session;
    },
  },
});
