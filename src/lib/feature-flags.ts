export const featureFlags = {
  welcomeEmail: process.env.NEXT_PUBLIC_FF_WELCOME_EMAIL === 'true',
} as const;
