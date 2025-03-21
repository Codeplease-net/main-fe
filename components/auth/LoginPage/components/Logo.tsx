import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface LogoProps {
  mode: 'login' | 'register' | 'reset';
  locale: string;
}

export const Logo = ({ mode, locale }: LogoProps) => {
  const t = useTranslations('Auth');
  
  const getTitleKey = () => {
    switch (mode) {
      case 'login': return 'signIn';
      case 'register': return 'createAccount';
      case 'reset': return 'resetPassword';
    }
  };
  
  const getPromptKey = () => {
    switch (mode) {
      case 'login': return 'signInPrompt';
      case 'register': return 'registerPrompt';
      case 'reset': return 'resetPasswordPrompt';
    }
  };
  
  return (
    <div className="text-center mb-8">
      <Link href={`/${locale}`} className="inline-block">
        <Image 
          src="/icon.png" 
          alt="Logo" 
          width={60} 
          height={60} 
          className="mx-auto mb-4"
        />
      </Link>
      <h1 className="text-3xl font-bold">{t(getTitleKey())}</h1>
      <p className="text-muted-foreground mt-2">{t(getPromptKey())}</p>
    </div>
  );
};