import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { FormMessageProps } from '../../types';

export const FormMessage = ({ error, success, verificationSent = false }: FormMessageProps) => {
  const t = useTranslations('Auth');
  
  return (
    <>
      {/* Verification sent message */}
      {verificationSent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
        >
          <h4 className="font-medium">{t("verificationEmailSent")}</h4>
          <p className="text-sm mt-1">{t("checkEmailVerification")}</p>
        </motion.div>
      )}
      
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive"
        >
          {error}
        </motion.div>
      )}
      
      {/* Success message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        >
          {success}
        </motion.div>
      )}
    </>
  );
};