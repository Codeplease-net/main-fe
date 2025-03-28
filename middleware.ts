import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … files with an extension (e.g. favicon.ico)
    // - /_next/ (Next.js internals)
    // - /api/ (API routes)
    '/((?!api|_next|.*\\.[^/]*$).*)'
  ]
};