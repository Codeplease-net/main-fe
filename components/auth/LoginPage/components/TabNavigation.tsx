import { useTranslations } from 'next-intl';
import { TabNavigationProps } from '../../types';

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const t = useTranslations('Auth');
  
  return (
    <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
      <button
        className={`flex-1 py-2 px-4 text-center border-b-2 transition-colors ${
          activeTab === 'login'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => onTabChange('login')}
      >
        {t("signIn")}
      </button>
      <button
        className={`flex-1 py-2 px-4 text-center border-b-2 transition-colors ${
          activeTab === 'register'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => onTabChange('register')}
      >
        {t("register")}
      </button>
    </div>
  );
};