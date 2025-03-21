"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  Flag, 
  Calendar, 
  Loader2, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/api/Readfirebase";
import { useAuth } from "../hooks/useAuth";
import { useProfileFormValidation } from "../hooks/useFormValidation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { KYCData } from "../types";
import { countries } from "countries-list";

import logo from "@/public/logoheadblack.png"

export default function UpdateProfilePage() {
  const { updateUserProfile, isLoading: authLoading, error: authError, successMessage } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<KYCData>({
    handle: "",
    fullName: "",
    country: "",
    birthdate: ""
  });

  const { 
    errors,
    isHandleAvailable, 
    isHandleChecking,
    validateForm,
    resetErrors,
    clearError,
    getDateLimits
  } = useProfileFormValidation(profileData);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false);
  
  // Date limits and age calculation
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 120);
  const minDateString = minDate.toISOString().split('T')[0];
  const maxDateString = today.toISOString().split('T')[0];
  
  const age = useMemo(() => {
    if (!profileData.birthdate) return null;
    
    try {
      const birthDate = new Date(profileData.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (err) {
      return null;
    }
  }, [profileData.birthdate]);

  // Form completion percentage for progress indicator
  const completionPercentage = useMemo(() => {
    let filled = 0;
    let total = 4; // Total number of required fields
    
    if (profileData.handle) filled++;
    if (profileData.fullName) filled++;
    if (profileData.country) filled++;
    if (profileData.birthdate) filled++;
    
    return Math.round((filled / total) * 100);
  }, [profileData]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            handle: userData.handle || "",
            fullName: userData.fullName || "",
            country: userData.country || "",
            birthdate: userData.birthdate || ""
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast({
          title: "Error",
          description: "Failed to load your profile data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, toast]);

  const handleChange = (field: keyof KYCData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormTouched(true);
    setProfileData({
      ...profileData,
      [field]: e.target.value
    });
    
    if (error) setError(null);
    clearError(field);
  };

  const handleSelectChange = (field: keyof KYCData) => (value: string) => {
    setFormTouched(true);
    setProfileData({
      ...profileData,
      [field]: value
    });
    
    if (error) setError(null);
    clearError(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      if (errors.form) setError(errors.form);
      else if (errors.handle) setError(errors.handle);
      else if (errors.birthdate) setError(errors.birthdate);
      else if (errors.fullName) setError(errors.fullName);
      else if (errors.country) setError(errors.country);
      return;
    }
    
    setIsSaving(true);
    
    try {
      const success = await updateUserProfile(profileData);
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
        });
        router.push("/");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle auth state effects
  useEffect(() => {
    if (successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }
    
    if (authError) {
      setError(authError);
    }
  }, [successMessage, authError, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl backdrop-blur-sm bg-background/50 border shadow-md">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-background to-muted/20">
      {/* Left column with logo - shown only on larger screens */}
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
            <h2 className="text-xl xl:text-2xl font-bold text-primary">Almost there!</h2>
            <p className="text-sm xl:text-base text-muted-foreground max-w-sm leading-relaxed">
              Just one more step to complete your account setup and access all platform features.
            </p>
          </div>
          
          {/* Security assurance */}
          <div className="bg-gradient-to-r from-primary/5 to-background border border-primary/20 rounded-xl p-5 max-w-sm shadow-sm">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1.5">
                <h3 className="font-medium text-sm text-foreground">Secure Profile Information</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your information is securely stored and helps us provide you with a personalized experience.
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress indicator for desktop */}
          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground">Profile completion</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {completionPercentage}%
              </Badge>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
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
            
            {/* Mobile progress badge */}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Step 2 of 2
            </Badge>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-md lg:max-w-lg">
            <div className="mb-6 md:mb-8 text-center">
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Please provide the following information to continue to your account
              </p>
              
              {/* Mobile progress indicator */}
              <div className="mt-4 lg:hidden">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Profile completion</span>
                  <span className="text-xs font-medium text-primary">{completionPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Card className="border-border/50 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-4 md:pb-6 bg-muted/30">
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  This information is required to activate your account.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start animate-in slide-in-from-top duration-300">
                      <AlertCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <div className="space-y-5">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="handle" className="flex items-center text-sm md:text-base font-medium">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        Username <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative group">
                        <Input
                          id="handle"
                          placeholder="Choose a unique username"
                          value={profileData.handle}
                          onChange={handleChange("handle")}
                          className={`pr-10 h-10 md:h-11 text-sm md:text-base transition-all duration-200 border-border/60 
                            ${isHandleAvailable === true ? 'border-green-500 focus-visible:ring-green-500/20' : 
                            isHandleAvailable === false ? 'border-red-500 focus-visible:ring-red-500/20' : 
                            'group-hover:border-primary/50'}`}
                          required
                        />
                        
                        {isHandleChecking && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        
                        {!isHandleChecking && isHandleAvailable === true && profileData.handle.length >= 3 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                          </div>
                        )}
                        
                        {!isHandleChecking && isHandleAvailable === false && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {isHandleChecking ? "Checking availability..." : 
                         isHandleAvailable === false ? "This username is already taken" : 
                         "Your unique username for identification on the platform"}
                      </p>
                    </div>
                    
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center text-sm md:text-base font-medium">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        Full Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={profileData.fullName}
                        onChange={handleChange("fullName")}
                        className="h-10 md:h-11 text-sm md:text-base border-border/60 transition-colors hover:border-primary/50"
                        required
                      />
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Your real name, as you'd like it to appear on your profile
                      </p>
                    </div>
                                  
                    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                      {/* Country */}
                      <div className="space-y-2">
                        <Label htmlFor="country" className="flex items-center text-sm md:text-base font-medium">
                          <Flag className="h-4 w-4 mr-2 text-primary" />
                          Country <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select 
                          value={profileData.country} 
                          onValueChange={handleSelectChange("country")}
                          required
                        >
                          <SelectTrigger className="h-10 md:h-11 text-sm md:text-base border-border/60 transition-colors hover:border-primary/50">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <div className="max-h-[250px] overflow-y-auto">
                              {Object.entries(countries).map(([code, country]) => (
                                <SelectItem key={code} value={code} className="text-sm">
                                  {country.name}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Select your country of residence
                        </p>
                      </div>
                      
                      {/* Birthdate - without age restriction */}
                      <div className="space-y-2">
                        <Label htmlFor="birthdate" className="flex items-center text-sm md:text-base font-medium">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          Date of Birth <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="birthdate"
                            type="date"
                            value={profileData.birthdate}
                            onChange={handleChange("birthdate")}
                            min={minDateString}
                            max={maxDateString}
                            className="h-10 md:h-11 pr-12 text-sm md:text-base border-border/60 transition-colors hover:border-primary/50"
                            required
                          />
                          
                          {age !== null && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Badge variant="outline" className="text-xs">
                                {`Age: ${age}`}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Your date of birth
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              
              <Separator className="bg-border/50" />
              
              <CardFooter className="flex justify-center p-6">
                <Button 
                  onClick={handleSubmit}
                  disabled={
                    isSaving || 
                    authLoading || 
                    isHandleAvailable === false || 
                    isHandleChecking || 
                    !profileData.handle
                  }
                  className="gap-2 min-w-[220px] font-medium transition-all"
                  size="lg"
                >
                  {(isSaving || authLoading) ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving Information...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
}