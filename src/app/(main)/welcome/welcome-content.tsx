'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  LinkedinLogo,
  PencilSimpleLine,
  Compass,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';
import { useAuth } from '@/components/auth-provider';
import { trackEvent } from '@/lib/analytics';
import { resolvePathHref, markOnboardingSeen } from '@/lib/onboarding';
import { featureFlags } from '@/lib/feature-flags';
import { onboardingPaths } from './onboarding-paths';
import { EmailBanner } from './email-banner';
import { buttonVariants } from '@/components/ui/button';
import { TouchSafeCard } from '@/components/ui/touch-safe-card';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const ICON_MAP = { LinkedinLogo, PencilSimpleLine, Compass } as const;

export function WelcomeContent() {
  const t = useTranslations('welcome');
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace('/login?returnTo=/welcome');
      return;
    }

    markOnboardingSeen();
    trackEvent('onboarding_view');
  }, [isLoading, session, router]);

  if (isLoading || !session) return null;

  const displayName = session.displayName ?? session.handle;
  const heroPath = onboardingPaths.find((p) => p.hero);
  const secondaryPaths = onboardingPaths.filter((p) => !p.hero).sort((a, b) => a.order - b.order);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
        <h1 className="text-3xl font-bold tracking-tight">
          {session.displayName ? t('title', { displayName }) : t('titleGeneric')}
        </h1>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {/* Hero card */}
        {heroPath &&
          (() => {
            const HeroIcon = ICON_MAP[heroPath.iconName];
            const href = resolvePathHref(heroPath.href, session.handle);
            return (
              <TouchSafeCard
                href={href}
                className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-75"
              >
                <Card className="bg-[#4385BE]/[0.04] ring-[#4385BE]/20 transition-shadow duration-200 pointer-fine:hover:shadow-md pointer-fine:hover:ring-[#4385BE]/30">
                  <CardHeader>
                    <div className="mb-1">
                      <HeroIcon size={heroPath.iconSize} weight="duotone" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg">{t(`paths.${heroPath.id}.title`)}</CardTitle>
                    <CardDescription>{t(`paths.${heroPath.id}.description`)}</CardDescription>
                  </CardHeader>

                  {heroPath.benefits && heroPath.benefits.length > 0 && (
                    <CardContent>
                      <ul className="flex flex-col gap-1.5">
                        {heroPath.benefits.map((benefitKey) => (
                          <li key={benefitKey} className="flex items-start gap-2 text-sm">
                            <CheckCircle
                              size={16}
                              weight="fill"
                              className="mt-0.5 shrink-0 text-[#4385BE]"
                              aria-hidden="true"
                            />
                            <span>{t(benefitKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}

                  <CardFooter>
                    <Link
                      href={href}
                      className={buttonVariants({
                        variant: heroPath.buttonVariant,
                        size: heroPath.buttonSize,
                      })}
                    >
                      {t(`paths.${heroPath.id}.cta`)}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </CardFooter>
                </Card>
              </TouchSafeCard>
            );
          })()}

        {/* Secondary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-150">
          {secondaryPaths.map((path) => {
            const PathIcon = ICON_MAP[path.iconName];
            const href = resolvePathHref(path.href, session.handle);
            return (
              <TouchSafeCard
                key={path.id}
                href={href}
                className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-shadow duration-200 pointer-fine:hover:shadow-sm pointer-fine:hover:ring-foreground/20">
                  <CardHeader>
                    <div className="mb-1 text-muted-foreground">
                      <PathIcon size={path.iconSize} aria-hidden="true" />
                    </div>
                    <CardTitle>{t(`paths.${path.id}.title`)}</CardTitle>
                    <CardDescription>{t(`paths.${path.id}.description`)}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link
                      href={href}
                      className={buttonVariants({
                        variant: path.buttonVariant,
                        size: path.buttonSize,
                      })}
                    >
                      {t(`paths.${path.id}.cta`)}
                    </Link>
                  </CardFooter>
                </Card>
              </TouchSafeCard>
            );
          })}
        </div>
      </div>

      {/* Email banner */}
      {featureFlags.welcomeEmail && (
        <div className="mt-6">
          <EmailBanner />
        </div>
      )}

      {/* Skip link */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('skipForNow')}
        </Link>
      </div>
    </main>
  );
}
