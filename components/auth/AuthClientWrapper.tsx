"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import * as firebaseModule from "@/api/Readfirebase";
import * as firestoreModule from "firebase/firestore";

export default function AuthClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get translations
  // If you're not using next-intl everywhere yet, wrap this in a try-catch
  const t = useTranslations("Common");

  // Improved redirect that avoids full page reloads when possible
  const smoothRedirect = (destination: string, message?: string) => {
    setIsRedirecting(true);

    if (message) {
      toast.info(message);
    }

    // Short delay for animation
    setTimeout(() => {
      // Check if this is an auth redirect with a return path
      const isAuthRedirect =
        destination.startsWith("/login?redirect=") ||
        destination.startsWith("/signup?redirect=");

      // Use router for everything except auth redirects (which need the query param preserved)
      if (!isAuthRedirect && destination.startsWith("/")) {
        // For internal links, use router.push to avoid page reload
        router.push(destination);
      } else {
        // For auth redirects or external URLs use window.location.href
        window.location.href = destination;
      }
    }, 300); // Shorter delay for better performance
  };

  useEffect(() => {
    // Safety timeout
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setIsAuthChecked(true);
      setIsRedirecting(false);
    }, 3000); // Shorter timeout
    
    // Get current path and redirect param
    const currentPath = window.location.pathname;
    const redirectParam = searchParams?.get("redirect");

    // Check path types
    const isProblemsBankPath = currentPath.includes("/problems-bank");
    const isUsersManagementPath = currentPath.includes("/users-management");
    const isLogsPath = currentPath.includes("/logs"); // Add logs path check
    const isUpdateProfilePath = currentPath === "/update-profile";
    const isAuthPath = currentPath.includes("/login");

    // Initialize listeners and state
    let maintenanceUnsubscribe: (() => void) | null = null;
    let authUnsubscribe: (() => void) | null = null;

    // Set up maintenance listener
    const setupMaintenanceListener = async () => {
      try {
        const db = firebaseModule.db;
        const { doc, onSnapshot } = firestoreModule;

        if (!db) {
          console.error("Firebase DB not initialized properly");
          throw new Error("Firebase DB not available");
        }

        // Set up real-time listener for maintenance status
        const serverConfigRef = doc(db, "config", "server");
        maintenanceUnsubscribe = onSnapshot(serverConfigRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const config = docSnapshot.data();
            
            // Update maintenance state when data changes
            if (config.maintenance === true) {
              setIsInMaintenance(true);
              setMaintenanceMessage(config.maintenanceMessage || "");
            } else {
              setIsInMaintenance(false);
              setMaintenanceMessage("");
            }
          } else {
            // No maintenance config found
            setIsInMaintenance(false);
            setMaintenanceMessage("");
          }
          
          // Now that we have maintenance status, check authentication
          // Only start auth check if it hasn't been set up yet
          if (!authUnsubscribe) {
            checkAuth();
          }
        }, (error) => {
          console.error("Maintenance listener error:", error);
          setIsInMaintenance(false);
          
          // Still proceed with auth check on error
          if (!authUnsubscribe) {
            checkAuth();
          }
        });
      } catch (error) {
        console.error("Setup maintenance listener error:", error);
        setIsInMaintenance(false);
        
        // Proceed with auth check on error
        if (!authUnsubscribe) {
          checkAuth();
        }
      }
    };

    // Handle authentication
    const checkAuth = async () => {
      try {
        const auth = firebaseModule.auth;
        const db = firebaseModule.db;
        const { doc, getDoc } = firestoreModule;

        if (!auth || !db) {
          console.error("Firebase not initialized properly");
          throw new Error("Firebase not available");
        }

        // Set up auth state listener
        authUnsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          try {
            if (currentUser) {
              // User is logged in
              
              // CHECK EMAIL VERIFICATION - Add this section
              if (!currentUser.emailVerified) {
                console.log("Email not verified, signing out user:", currentUser.email);
                // Sign out the user
                await auth.signOut();
                
                // Show a toast notification explaining the reason
                toast.error(t("auth.emailVerificationRequired"));
                
                // Redirect to login page if not already there
                if (!isAuthPath) {
                  smoothRedirect("/login", t("auth.pleaseVerifyEmail"));
                }
                
                // Set loading states and return early
                setIsLoading(false);
                setIsAuthChecked(true);
                setIsRedirecting(false);
                return;
              }
              // END EMAIL VERIFICATION CHECK
              
              sessionStorage.setItem("authChecked", "true");
              const userDoc = await getDoc(doc(db, "users", currentUser.uid));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const userIsAdmin = userData.admin === true;
                
                // If in maintenance mode and user is not admin, show maintenance screen
                // This is now controlled by the maintenance listener
                if (isInMaintenance && !userIsAdmin) {
                  setIsLoading(false);
                  return;
                }
                
                // Rest of the existing logged-in user logic...
                // Handle auth pages for logged-in users
                if (isAuthPath) {
                  if (redirectParam) {
                    smoothRedirect(
                      redirectParam,
                      "Redirecting you to your destination"
                    );
                    return;
                  } else {
                    smoothRedirect("/", "You're already logged in");
                    return;
                  }
                }
                
                // Check user roles and profile completion
                const userIsProblemSetter = userData["problem-setter"] === true;
                const isComplete =
                  userData.handle &&
                  userData.fullName &&
                  userData.country &&
                  userData.birthdate;
                
                // Handle redirects for specific scenarios
                if (isComplete && isUpdateProfilePath) {
                  smoothRedirect("/", "Your profile is already complete");
                  return;
                }
                
                if (isProblemsBankPath && !userIsAdmin && !userIsProblemSetter) {
                  smoothRedirect("/", "You don't have access to this area");
                  return;
                }
                
                // Protect admin-only routes: users management and logs
                if ((isUsersManagementPath || isLogsPath) && !userIsAdmin) {
                  smoothRedirect("/", "Only administrators can access this area");
                  return;
                }
                
                if (!isComplete && !isUpdateProfilePath && !isAuthPath) {
                  smoothRedirect("/update-profile", "Please complete your profile");
                  return;
                }
              } else {
                // Handle missing user data
                if (!isUpdateProfilePath && !isAuthPath) {
                  smoothRedirect("/update-profile", "Please complete your profile");
                  return;
                }
                
                if (isProblemsBankPath || isUsersManagementPath || isLogsPath) {
                  smoothRedirect("/", "You don't have access to this area");
                  return;
                }
              }
            } else {
              // User is not logged in
              sessionStorage.setItem("authChecked", "true");
              
              // Show maintenance for non-logged in users
              // Now controlled by the maintenance listener
              if (isInMaintenance) {
                setIsLoading(false);
                return;
              }
              
              // Rest of the existing non-logged in user logic...
              if (isUpdateProfilePath) {
                smoothRedirect("/login", "Please login");
                return;
              }
              
              // Require authentication for protected routes
              if (isProblemsBankPath || isUsersManagementPath || isLogsPath) {
                const encodedPath = encodeURIComponent(currentPath);
                smoothRedirect(
                  `/login?redirect=${encodedPath}`,
                  "Authentication required"
                );
                return;
              }
            }
            
            // If we get here, no redirects needed
            setIsLoading(false);
            setIsAuthChecked(true);
            setIsRedirecting(false);
          } catch (error) {
            console.error("Auth state processing error:", error);
            setIsLoading(false);
            setIsAuthChecked(true);
            setIsRedirecting(false);
          }
        });
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
        setIsAuthChecked(true);
        setIsRedirecting(false);
      }
    };

    // Start listeners
    setupMaintenanceListener();

    // Clean up listeners on unmount
    return () => {
      clearTimeout(safetyTimer);
      
      // Clean up the maintenance listener if it exists
      if (maintenanceUnsubscribe) {
        maintenanceUnsubscribe();
      }
      
      // Clean up the auth listener if it exists
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, [router]);

  // Maintenance screen
  if (isInMaintenance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
        <div className="max-w-md p-6 rounded-lg border border-border bg-card shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-primary"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("maintenance.title")}
              </h2>
            </div>

            <p className="mb-4 text-muted-foreground">
              {maintenanceMessage || t("maintenance.message")}
            </p>

            <div className="px-6 py-4 mt-6 bg-muted/40 rounded-md text-sm">
              <p>
                {t("maintenance.estimatedTime") || "Estimated completion time:"}
              </p>
              <p className="font-medium mt-1">
                {new Date().toLocaleDateString()}{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !isAuthChecked || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent animate-spin"></div>
        {isRedirecting && (
          <p className="text-sm text-muted-foreground">{t("redirecting")}</p>
        )}
      </div>
    );
  }

  // Render children with simple fade
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
