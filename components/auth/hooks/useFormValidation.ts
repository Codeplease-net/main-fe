import { useState, useEffect, useRef } from 'react';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/api/Readfirebase';
import { KYCData } from '../types';

/**
 * Interface for profile validation error messages
 */
type ProfileValidationErrors = {
  handle?: string;
  fullName?: string;
  country?: string;
  birthdate?: string;
  form?: string;
};

/**
 * Hook for handling form validation specifically for user profile update
 * This handles validation for handle availability and required fields
 */
export const useProfileFormValidation = (profileData: KYCData) => {
  // Validation state
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [isHandleAvailable, setIsHandleAvailable] = useState<boolean | null>(null);
  const [isHandleChecking, setIsHandleChecking] = useState(false);
  
  // Track if this is the initial load to prevent unnecessary checking
  const isInitialMount = useRef(true);
  const lastCheckedHandle = useRef<string>("");
  
  // Check handle availability with debounce
  useEffect(() => {
    // Skip check on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // If user already has a handle loaded, it's available to them
      if (profileData.handle && auth.currentUser?.displayName === profileData.handle) {
        setIsHandleAvailable(true);
      }
      return;
    }

    // Exit if handle is too short or hasn't changed since last check
    if (!profileData.handle || profileData.handle.length < 3 || profileData.handle === lastCheckedHandle.current) {
      return;
    }
    
    // Skip check if this is the user's existing handle
    if (auth.currentUser?.displayName === profileData.handle) {
      setIsHandleAvailable(true);
      return;
    }

    // Set the handle we're checking now
    lastCheckedHandle.current = profileData.handle;
    
    const checkHandle = async () => {
      setIsHandleChecking(true);
      
      try {
        // Use the modular Firebase syntax for querying
        const handleQuery = query(
          collection(db, "users"), 
          where("handle", "==", profileData.handle)
        );
        
        const querySnapshot = await getDocs(handleQuery);
        
        let isAvailable = true;
        querySnapshot.forEach(doc => {
          if (doc.id !== auth.currentUser?.uid) {
            isAvailable = false;
          }
        });
        
        setIsHandleAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking handle:", error);
        setIsHandleAvailable(null);
      } finally {
        setIsHandleChecking(false);
      }
    };

    const timer = setTimeout(checkHandle, 500);
    return () => clearTimeout(timer);
  }, [profileData.handle]);

  /**
   * Main validation function that checks all required fields and rules
   */
  const validateForm = (): boolean => {
    const newErrors: ProfileValidationErrors = {};
    let isValid = true;
    
    // Check required fields
    if (!profileData.handle || !profileData.fullName || !profileData.country || !profileData.birthdate) {
      newErrors.form = "All required fields must be completed.";
      isValid = false;
    }

    // Validate handle
    if (profileData.handle) {
      if (profileData.handle.length < 3) {
        newErrors.handle = "Username must be at least 3 characters long.";
        isValid = false;
      } else if (isHandleAvailable === false) {
        newErrors.handle = "This username is already taken. Please choose another one.";
        isValid = false;
      }
    } else {
      newErrors.handle = "Username is required.";
      isValid = false;
    }
    
    // Validate fullName
    if (!profileData.fullName) {
      newErrors.fullName = "Full name is required.";
      isValid = false;
    }
    
    // Validate country
    if (!profileData.country) {
      newErrors.country = "Country selection is required.";
      isValid = false;
    }
    
    // Validate birthdate - just check if present
    if (!profileData.birthdate) {
      newErrors.birthdate = "Date of birth is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Reset all errors
   */
  const resetErrors = () => {
    setErrors({});
  };

  /**
   * Clear a specific error
   */
  const clearError = (field: keyof ProfileValidationErrors) => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  };

  /**
   * Helper function to get date limits for birthdate input
   */
  const getDateLimits = () => {
    const today = new Date();
    
    // Maximum date (today)
    const maxDateString = today.toISOString().split('T')[0];
    
    // Minimum date (120 years ago)
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 120);
    const minDateString = minDate.toISOString().split('T')[0];

    return {
      minDate: minDateString,
      maxDate: maxDateString
    };
  };

  return {
    errors,
    isHandleAvailable,
    isHandleChecking,
    validateForm,
    resetErrors,
    clearError,
    getDateLimits
  };
};