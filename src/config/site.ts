export const siteConfig = {
  name: 'Orthonoba',
  baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'orthonoba.app',
  devBaseDomain: 'localhost',
  marketingSubdomains: ['www', ''] as string[],
}
