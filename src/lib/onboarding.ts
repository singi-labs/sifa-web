const ONBOARDING_SEEN_KEY = 'sifa:onboarding-seen';
const EMAIL_DISMISSED_KEY = 'sifa:welcome-email-dismissed';

export function markOnboardingSeen(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  }
}

export function hasSeenOnboarding(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ONBOARDING_SEEN_KEY) === 'true';
  }
  return false;
}

export function isEmailBannerDismissed(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(EMAIL_DISMISSED_KEY) === 'true';
  }
  return false;
}

export function dismissEmailBanner(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMAIL_DISMISSED_KEY, 'true');
  }
}

export function resolvePathHref(href: string, handle: string): string {
  if (href === 'dynamic:profile') {
    return `/p/${handle}`;
  }
  return href;
}
