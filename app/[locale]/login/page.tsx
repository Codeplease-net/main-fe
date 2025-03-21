import React from 'react';
import { getTranslations } from 'next-intl/server';
import LoginPage from '@/components/auth/LoginPage';

// Generate metadata for the page
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'Auth' });
  
  return {
    title: t('signIn'),
    description: t('signInPrompt'),
  };
}

export default function Login({
  params: { locale },
  searchParams
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract the redirect URL from search params
  const redirectUrl = typeof searchParams.redirect === 'string' 
    ? searchParams.redirect 
    : '/';
  
  // Pass the redirect URL to the LoginPage component
  return <LoginPage redirectUrl={redirectUrl} />;
}