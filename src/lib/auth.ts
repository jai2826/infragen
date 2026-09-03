import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

function getValidBaseUrl(): string {
  const candidate = process.env.BETTER_AUTH_URL;
  if (candidate && candidate !== '[SENSITIVE]') {
    try {
      new URL(candidate);
      return candidate;
    } catch {
      // ignore invalid URL
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

function getValidSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (secret && secret !== '[SENSITIVE]') {
    return secret;
  }
  return 'infragen-dev-secret-replace-in-env-or-dashboard';
}

const rawClientId = process.env.GITHUB_CLIENT_ID;
const rawClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: rawClientId && rawClientId !== '[SENSITIVE]' ? rawClientId : '',
      clientSecret: rawClientSecret && rawClientSecret !== '[SENSITIVE]' ? rawClientSecret : '',
    },
  },
  secret: getValidSecret(),
  baseURL: getValidBaseUrl(),
});

export type Session = typeof auth.$Infer.Session;
