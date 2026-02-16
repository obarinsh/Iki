import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't redirect to default locale prefix
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/...)
  // - Static files (_next, images, etc.)
  // - Public assets (manifest.json, icons, etc.)
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
