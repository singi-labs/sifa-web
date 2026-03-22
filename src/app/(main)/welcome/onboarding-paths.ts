export interface OnboardingPath {
  /** Unique ID, maps to i18n key welcome.paths.{id}.* and tracking event */
  id: string;
  /** Whether this card gets hero visual treatment */
  hero: boolean;
  /** Phosphor icon component name */
  iconName: 'LinkedinLogo' | 'PencilSimpleLine' | 'Compass';
  /** Icon size in pixels */
  iconSize: number;
  /** Target route. 'dynamic:profile' resolves to /p/{handle} at render time */
  href: string;
  /** Button variant for the visual CTA */
  buttonVariant: 'default' | 'outline' | 'ghost';
  /** Button size */
  buttonSize: 'lg' | 'default';
  /** Sort order (lower = first) */
  order: number;
  /** i18n keys for benefit bullets (hero card only) */
  benefits?: string[];
}

export const onboardingPaths: OnboardingPath[] = [
  {
    id: 'import',
    hero: true,
    iconName: 'LinkedinLogo',
    iconSize: 40,
    href: '/import',
    buttonVariant: 'default',
    buttonSize: 'lg',
    order: 1,
    benefits: ['paths.import.benefit1', 'paths.import.benefit2', 'paths.import.benefit3'],
  },
  {
    id: 'manual',
    hero: false,
    iconName: 'PencilSimpleLine',
    iconSize: 32,
    href: 'dynamic:profile',
    buttonVariant: 'outline',
    buttonSize: 'default',
    order: 2,
  },
  {
    id: 'explore',
    hero: false,
    iconName: 'Compass',
    iconSize: 32,
    href: '/find-people',
    buttonVariant: 'ghost',
    buttonSize: 'default',
    order: 3,
  },
];
