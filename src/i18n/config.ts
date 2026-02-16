export const locales = ['en', 'ru', 'he'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  he: 'עברית',
};

export const rtlLocales: Locale[] = ['he'];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
