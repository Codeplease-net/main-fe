import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
  isLoading: boolean;
  initialEmail?: string;
}

export const ForgotPasswordForm = ({ 
  onSubmit, 
  onBack, 
  isLoading, 
  initialEmail = "" 
}: ForgotPasswordFormProps) => {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState(initialEmail);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };
  
  return (
    <>      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="reset-email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="you@example.com"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-muted-foreground">
            {t("resetPasswordHint")}
          </p>
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
              {t("sending")}
            </span>
          ) : (
            t("sendResetLink")
          )}
        </button>
      </form>
    </>
  );
};