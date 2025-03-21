import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '../components/PasswordInput';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  onForgotPassword: (email: string) => void;
  isLoading: boolean;
}

export const LoginForm = ({ onSubmit, onForgotPassword, isLoading }: LoginFormProps) => {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email input */}
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded-md border border-input bg-background"
          placeholder="you@example.com"
          disabled={isLoading}
          required
        />
      </div>
      
      {/* Password input */}
      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium">
          {t("password")}
        </label>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      {/* Forgot password link */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onForgotPassword(email)}
          className="text-sm text-primary hover:underline"
        >
          {t("forgotPassword")}
        </button>
      </div>
      
      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 size={18} className="animate-spin mr-2" />
            {t("signingIn")}
          </span>
        ) : (
          t("signIn")
        )}
      </button>
    </form>
  );
};