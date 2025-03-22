import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/api/Readfirebase";
import { KYCData } from "../types";
import { validatePassword, validateBirthdate } from "../utils/validation";

// Define user role type
type UserRole = "user" | "admin" | "problem-setter" | null;

export function useAuth() {
  const t = useTranslations("Auth");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Listen for auth state changes and fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Check for role based on boolean flags in Firestore
            if (userData.admin === true) {
              setUserRole("admin");
            } else if (userData["problem-setter"] === true) {
              setUserRole("problem-setter");
            } else {
              setUserRole("user");
            }
          } else {
            setUserRole("user"); // Default role if no user document exists
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setUserRole("user"); // Default to basic user on error
        }
      } else {
        setUserRole(null);
      }

      setIsLoadingUser(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Reset state
  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
    setVerificationSent(false);
  };

  // Login function
  const login = async (email: string, password: string, redirectUrl?: string) => {
    resetMessages();

    if (!email || !password) {
      setError(t("fieldsRequired"));
      return false; // Return false to indicate failure
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified - this is the critical part
      if (!user.emailVerified) {
        setError(t("emailNotVerified"));
        // Send a new verification email
        await sendEmailVerification(user);
        setSuccessMessage(t("verificationEmailResent"));
        setVerificationSent(true); // Set this to true to show verification UI
        setIsLoading(false);
        return false; // Return false to indicate login should not proceed
      }

      // Email is verified, continue with login
      // UPDATE FIRESTORE to reflect emailVerified status
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { emailVerified: true }, { merge: true });

      setSuccessMessage(t("loginSuccess"));

        // Log for debugging
        console.log("Redirecting to:", redirectUrl || "/");
        
        // Simplified redirection logic
        if (redirectUrl) {
          // Just use the redirect URL directly without additional processing
          window.location.href = redirectUrl;
        } else {
          // Default to home page
          window.location.href = "/";
        }

      return true; // Return true to indicate successful login
    } catch (err: any) {
      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/invalid-email":
          setError(t("invalidEmail"));
          break;
        case "auth/user-not-found":
          setError(t("userNotFound"));
          break;
        case "auth/wrong-password":
          setError(t("wrongPassword"));
          break;
        case "auth/too-many-requests":
          setError(t("tooManyRequests"));
          break;
        default:
          setError(t("loginFailed"));
          console.error("Login error:", err);
      }
      return false; // Return false to indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified register function - only handles account creation
  const register = async (
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    resetMessages();

    // Validate form fields
    if (!email || !password || !confirmPassword) {
      setError(t("fieldsRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (!validatePassword(password)) {
      setError(t("passwordRequirements"));
      return;
    }

    setIsLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      setVerificationSent(true);

      // Store minimal user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        emailVerified: false,
        createdAt: serverTimestamp(),
        profileCompleted: false, // Flag to indicate profile needs completion
      });

      // Show success message
      setSuccessMessage(t("registrationSuccessVerifyEmail"));
    } catch (err: any) {
      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/email-already-in-use":
          setError(t("emailAlreadyInUse"));
          break;
        case "auth/invalid-email":
          setError(t("invalidEmail"));
          break;
        case "auth/weak-password":
          setError(t("weakPassword"));
          break;
        default:
          setError(t("registrationFailed"));
          console.error("Registration error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // New function to update user profile after registration
  const updateUserProfile = async (profileData: KYCData): Promise<boolean> => {
    resetMessages();

    if (!auth.currentUser) {
      setError(t("userNotAuthenticated"));
      return false;
    }

    // Validate form fields
    if (
      !profileData.handle ||
      !profileData.fullName ||
      !profileData.country ||
      !profileData.birthdate
    ) {
      setError(t("fieldsRequired"));
      return false;
    }

    // Validate handle
    if (profileData.handle.length < 3) {
      setError(t("handleTooShort"));
      return false;
    }

    // Validate birthdate
    if (!validateBirthdate(profileData.birthdate)) {
      setError(t("invalidBirthdate"));
      return false;
    }

    setIsLoading(true);

    try {
      // Check if handle is already taken
      const handleQuery = query(
        collection(db, "users"),
        where("handle", "==", profileData.handle)
      );
      const querySnapshot = await getDocs(handleQuery);

      // Only check duplicates if documents exist AND they don't belong to current user
      let isDuplicate = false;
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          if (doc.id !== auth.currentUser?.uid) {
            isDuplicate = true;
          }
        });
      }

      if (isDuplicate) {
        setError(t("handleAlreadyTaken"));
        return false;
      }

      // Update Firebase user profile with display name
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: profileData.handle,
      });

      // Update user document in Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        handle: profileData.handle,
        fullName: profileData.fullName,
        country: profileData.country,
        birthdate: profileData.birthdate,
        updatedAt: serverTimestamp(),
        profileCompleted: true,
      });

      setSuccessMessage(t("profileUpdateSuccess"));
      return true;
    } catch (err: any) {
      setError(t("profileUpdateFailed"));
      console.error("Profile update error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    resetMessages();

    if (!email) {
      setError(t("emailRequired"));
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(t("resetEmailSent"));
    } catch (err: any) {
      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/invalid-email":
          setError(t("invalidEmail"));
          break;
        case "auth/user-not-found":
          setError(t("userNotFound"));
          break;
        default:
          setError(t("resetEmailError"));
          console.error("Password reset error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    resetPassword,
    updateUserProfile,
    resetMessages,
    isLoading,
    error,
    successMessage,
    verificationSent,
    user,
    userRole,
    isLoadingUser,
  };
}
