"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { validatePassword } from "../../utils/validation";

interface RegisterFormProps {
  onSubmit: (email: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading: boolean;
}

export default function RegisterForm({ 
  onSubmit,
  isLoading
}: RegisterFormProps) {
  const t = useTranslations("Auth");
  
  // Form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate all fields
    const isValid = validateAllFields();
    if (!isValid) return;
    
    // Call the onSubmit prop (register function from useAuth)
    try {
      await onSubmit(registerEmail, registerPassword, confirmPassword);
      resetForm();
    } catch (err) {
      // Error handling is done in useAuth
      console.error("Registration error", err);
    }
  };

  // Validate all form fields
  const validateAllFields = () => {
    if (!registerEmail || !registerPassword || !confirmPassword) {
      setFormError(t("fieldsRequired"));
      return false;
    }

    if (registerPassword !== confirmPassword) {
      setFormError(t("passwordsDoNotMatch"));
      return false;
    }

    if (!validatePassword(registerPassword)) {
      setFormError(t("passwordRequirements"));
      return false;
    }

    return true;
  };

  // Reset form
  const resetForm = () => {
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* Display form error if any */}
      {formError && (
        <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-800 rounded-md">
          {formError}
        </div>
      )}
      
      {/* Email input */}
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="register-email"
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          className="w-full p-2 rounded-md border border-input bg-background"
          placeholder="you@example.com"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t("emailVerificationRequired")}
        </p>
      </div>
      
      {/* Password input */}
      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium">
          {t("password")}
        </label>
        <div className="relative">
          <input
            id="register-password"
            type={showRegisterPassword ? "text" : "password"}
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="••••••••"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showRegisterPassword ? t("hidePassword") : t("showPassword")}
          >
            {showRegisterPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("passwordHint")}
        </p>
      </div>
      
      {/* Confirm Password input */}
      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          {t("confirmPassword")}
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="••••••••"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
            
      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none mt-4"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 size={18} className="animate-spin mr-2" />
            {t("creatingAccount")}
          </span>
        ) : (
          t("createAccount")
        )}
      </button>
    </form>
  );
}