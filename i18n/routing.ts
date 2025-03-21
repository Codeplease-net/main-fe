import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: 'en',
  localePrefix: 'never' // Add this line to hide the locale prefix
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);