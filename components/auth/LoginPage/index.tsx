"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { 
  ArrowLeft, 
  Mail, 
  LogIn, 
  UserPlus, 
  UserCheck, 
  Lock, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle 
} from "lucide-react";

// Auth components
import { LoginForm } from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import { ForgotPasswordForm } from "./forms/ForgotPasswordForm";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import logo (you'll need to add this to your project)
import logo from "@/public/logo.png";

// Page animations
const pageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export default function LoginPage({redirectUrl}: {redirectUrl: string}) {
  const t = useTranslations("Auth");
  const params = useParams();
  
  const locale = params.locale || 'en';
  const { login, register, resetPassword, resetMessages, isLoading, error, successMessage, verificationSent } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("login");
      
  // Password reset states
  const [resetSent, setResetSent] = useState<boolean>(false);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetMessages();
    setResetSent(false);
  };

  // Handle forgot password
  const handleForgotPassword = (email: string) => {
    handleTabChange("forgotPassword");
  };
  
  // Handle back button for sub-views
  const handleBackToLogin = () => {
    setActiveTab("login");
    resetMessages();
    setResetSent(false);
  };

  // Email verification and password reset view
  const renderSpecialView = () => {
    if (verificationSent) {
      return (
        <div className="p-6">
          <button 
            onClick={handleBackToLogin}
            className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            {t("backToLogin")}
          </button>
          
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Mail size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t("checkYourEmail")}</h2>
            <p className="text-muted-foreground mb-2">
              {t("verificationEmailSent")}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md text-yellow-800 dark:text-yellow-200 text-sm mb-4">
              <p>{t("checkSpamFolderNotice")}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("didntReceiveEmail")} <button className="text-primary hover:underline" onClick={() => resetMessages()}>{t("tryAgain")}</button>
            </p>
          </div>
        </div>
      );
    }
    
    if (resetSent) {
      return (
        <div className="p-6">
          <button 
            onClick={handleBackToLogin}
            className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            {t("backToLogin")}
          </button>
          
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Mail size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t("checkYourEmail")}</h2>
            <p className="text-muted-foreground mb-2">
              {t("resetEmailSent")} 
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md text-yellow-800 dark:text-yellow-200 text-sm mb-4">
              <p>{t("checkSpamFolderNotice")}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("didntReceiveEmail")} <button className="text-primary hover:underline" onClick={() => setResetSent(false)}>{t("tryAgain")}</button>
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-background to-muted/20">
      {/* Left column with branding - shown only on larger screens */}
      <div className="hidden lg:flex lg:w-1/3 xl:w-2/5 bg-gradient-to-b from-primary/5 to-primary/10 border-r items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Logo */}
          <div className="relative w-40 h-40 xl:w-48 xl:h-48 mb-2">
            <Image 
              src={logo}
              alt="Company Logo" 
              fill 
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          
          <div className="text-center space-y-3">
            <h2 className="text-xl xl:text-2xl font-bold text-primary">{t("welcomeTo")}</h2>
            <p className="text-sm xl:text-base text-muted-foreground max-w-sm leading-relaxed">
              {t("accountPlatformDesc")}
            </p>
          </div>
          
          {/* Security assurance */}
          <div className="bg-gradient-to-r from-primary/5 to-background border border-primary/20 rounded-xl p-5 max-w-sm shadow-sm">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1.5">
                <h3 className="font-medium text-sm text-foreground">Secure Authentication</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your account is protected with industry-standard security. We never store passwords in plain text.
                </p>
              </div>
            </div>
          </div>
          
          {/* Additional benefits */}
          <div className="w-full max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Personalized user experience</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Access to all platform features</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Seamless secure authentication</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right column with form content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-auto">
        {/* Mobile header - only visible on small screens */}
        <div className="lg:hidden border-b bg-background/95 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 shadow-sm">
          <div className="container flex justify-between items-center">
            <div className="relative w-32 h-8">
              <Image 
                src={logo}
                alt="Company Logo" 
                fill 
                className="object-contain"
              />
            </div>
            
            {/* Mobile badge */}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              Secure login
            </Badge>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-md lg:max-w-lg">
            {/* Mobile heading - only visible on small screens */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="text-2xl md:text-3xl font-bold">{t("welcomeTo")}</h1>
              <p className="text-muted-foreground mt-2">{t("accountPlatformDesc")}</p>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={pageVariants}
              className="w-full"
            >
              <Card className="border-border/50 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-md">
                {verificationSent || resetSent ? (
                  renderSpecialView()
                ) : (
                  <>
                    {/* Card header */}
                    <CardHeader className="pb-4 md:pb-6 bg-muted/30">
                      <CardTitle className="flex items-center text-lg md:text-xl">
                        <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                        {activeTab === "login" ? "Sign in to your account" : "Create new account"}
                      </CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        {activeTab === "login" 
                          ? "Enter your credentials to access your account" 
                          : "Fill in your information to create an account"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-4">
                      {/* Error and Success Messages */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="p-3.5 mb-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                              <AlertCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />
                              <span>{error}</span>
                            </div>
                          </motion.div>
                        )}
                        
                        {successMessage && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="p-3.5 mb-4 text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />
                              <span>{successMessage}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Enhanced Auth Tabs */}
                      <Tabs 
                        defaultValue="login" 
                        value={activeTab} 
                        onValueChange={handleTabChange} 
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2 w-full rounded-lg p-1.5 h-auto bg-muted/70 shadow-inner border border-border/20">
                          {/* Login Tab */}
                          <TabsTrigger 
                            value="login"
                            className="rounded-md py-3.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border data-[state=active]:text-primary transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                          >
                            <div className="flex items-center justify-center gap-2.5">
                              <div className="bg-primary/10 p-1.5 rounded-full transition-transform duration-300 group-hover:scale-110">
                                <LogIn size={16} className="text-primary" />
                              </div>
                              <span className="font-medium">{t("signIn")}</span>
                            </div>
                          </TabsTrigger>
                          
                          {/* Register Tab */}
                          <TabsTrigger 
                            value="register"
                            className="rounded-md py-3.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border data-[state=active]:text-primary transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                          >
                            <div className="flex items-center justify-center gap-2.5">
                              <div className="bg-primary/10 p-1.5 rounded-full transition-transform duration-300 group-hover:scale-110">
                                <UserPlus size={16} className="text-primary" />
                              </div>
                              <span className="font-medium">{t("createAccount")}</span>
                            </div>
                          </TabsTrigger>
                        </TabsList>
                        
                        <div className="pt-6">
                          <TabsContent value="login" className="mt-0">
                            <div className="mb-4 flex items-center gap-2 justify-center text-muted-foreground">
                              <Lock size={14} className="text-primary" />
                              <p className="text-sm">Secure login to your account</p>
                            </div>
                            <LoginForm 
                              onSubmit={(email, password) => login(email, password, redirectUrl)} 
                              onForgotPassword={handleForgotPassword}
                              isLoading={isLoading}
                            />
                          </TabsContent>
                          
                          <TabsContent value="register" className="mt-0">
                            <div className="mb-4 flex items-center gap-2 justify-center text-muted-foreground">
                              <UserCheck size={14} className="text-primary" />
                              <p className="text-sm">Create your personal account</p>
                            </div>
                            <RegisterForm 
                              onSubmit={register}
                              isLoading={isLoading}
                            />
                          </TabsContent>
                          
                          <TabsContent value="forgotPassword" className="mt-0">
                            <div className="mb-4">
                              <button 
                                onClick={() => handleTabChange("login")}
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ArrowLeft size={16} className="mr-1" />
                                {t("backToLogin")}
                              </button>
                            </div>
                            
                            <ForgotPasswordForm 
                              onSubmit={resetPassword}
                              onBack={() => handleTabChange("login")}
                              isLoading={isLoading}
                            />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </CardContent>
                    
                    {/* Security footer */}
                    <CardFooter className="flex justify-center bg-muted/20 border-t border-border/40 py-3 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Your connection is secure and your data is protected
                        </p>
                      </div>
                    </CardFooter>
                  </>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}