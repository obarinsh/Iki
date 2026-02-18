// TODO: Re-enable other languages when translations are complete
export const locales = ['en'] as const;
// export const locales = ['en', 'ru', 'he'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  // ru: 'Русский',
  // he: 'עברית',
};

// TODO: Re-enable when Hebrew is added back
export const rtlLocales: Locale[] = [];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
