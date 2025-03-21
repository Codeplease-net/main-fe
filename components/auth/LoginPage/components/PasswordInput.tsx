import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
}

export const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  disabled = false,
  required = true,
  hint
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations('Auth');
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full p-2 rounded-md border border-input bg-background"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? t("hidePassword") : t("showPassword")}
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
};