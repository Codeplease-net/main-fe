"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

// Firebase imports
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// UI Components
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert } from "lucide-react";

// Custom Components
import Login from "@/components/login";
import { WaitingModal } from "../../ui/modal";
import ProblemDescription from "./components/ProblemDescription";
import CodeEditor from "./components/CodeEditor";
import Submission from "./components/Submission/Submission";
import DotsLoader from "./components/DotsLoader";

// Utilities & Hooks
import { useProblem } from "./hooks/useProblem";
import { Button } from "@/components/ui/button";

export default function PlaygroundComponent({ id, tab, searchParams }: { tab: string, id: string, searchParams: { [key: string]: string | undefined }}) {
  // Get translations
  const t = useTranslations('Playground');

  // Tab state - initialize from URL path tab parameter
  const [selectedTab, setSelectedTabState] = useState<string>(tab || "description");
  
  // Use the problem hook to handle fetching and permissions
  const { problem, loading, hasAccess } = useProblem(id);
  
  // Function to update both state and URL when changing tabs
  const setSelectedTab = (newTab: string) => {
    // Update state first to avoid reload
    setSelectedTabState(newTab);
    
    // For tab changes, we need to change the URL path, not search params
    // First, preserve any existing query parameters
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.search;
    
    // Then construct the new path
    // Extract the base part before the tab (e.g., /problems/123)
    const basePath = `/problems/${id}`;
    
    // Add the tab to the path, or use default path if it's "description"
    let newPath = newTab === "description" ? basePath : `${basePath}/${newTab}`;
    
    // Add back any query parameters
    newPath += queryParams;
    
    // Use replaceState to update URL without triggering navigation/reload
    window.history.replaceState(null, '', newPath);
  };

  // Submission state
  const [displaySubmission, setDisplaySubmissionState] = useState<string | undefined>(
    searchParams.display_submission
  );

  // Function to update both state and URL when selecting a submission
  const setDisplaySubmission = (submissionId: string | undefined) => {
    // Update state first
    setDisplaySubmissionState(submissionId);
    
    // Update URL params without triggering a reload
    const url = new URL(window.location.href);
    
    if (submissionId) {
      url.searchParams.set('display_submission', submissionId);
    } else {
      url.searchParams.delete('display_submission');
    }
    
    // Use history API to avoid reload
    window.history.replaceState(null, '', url.toString());
  };
  
  // UI state
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [fullscreen, setFullscreen] = useState(0);
  
  // Sync with URL changes from external navigation (back/forward buttons)
  useEffect(() => {
    // When tab changes from external navigation (not our setSelectedTab function)
    if (tab && tab !== selectedTab) {
      setSelectedTabState(tab);
    }
  }, [tab]);

  useEffect(() => {
    // When submission display changes from external navigation
    const submissionFromURL = searchParams.display_submission;
    if (submissionFromURL !== displaySubmission) {
      setDisplaySubmissionState(submissionFromURL);
    }
  }, [searchParams.display_submission]);

  // Auth listener effect
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Responsive layout effect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // UI helpers
  const toggleLoginVisibility = () => {
    setIsLoginVisible(!isLoginVisible);
  };

  const onClickSubmission = (submissionId: string) => {
    setDisplaySubmission(submissionId);
  };

  const getPanelStyle = (panelNumber: number) => {
    if (fullscreen === 0) return {};
    return {
      flexGrow: fullscreen === panelNumber ? 1 : 0,
      flexBasis: fullscreen === panelNumber ? "100%" : "0%",
    };
  };

  // Render error state if we have no access
  if (!hasAccess && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <Alert 
          variant="destructive" 
          className="shadow-md border border-destructive/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <AlertTitle className="mb-2 text-lg font-semibold">
                {t('accessDenied')}
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <p className="text-sm text-card-foreground/90 leading-relaxed">
                  {t('noPermission')}
                </p>
                
                {!user ? (
                  <div className="pt-2">
                    <Button 
                      onClick={toggleLoginVisibility}
                      className="w-full sm:w-auto"
                    >
                      {t('logIn')}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('loginToAccess')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = "/problems"}
                      size="sm"
                    >
                      {t('backToProblems')}
                    </Button>
                    
                    <Button 
                      variant="secondary"
                      onClick={() => window.location.reload()}
                      size="sm"
                    >
                      {t('tryAgain')}
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </motion.div>
      
      {/* Login Modal */}
      <AnimatePresence>
        {isLoginVisible && (
          <Login
            onClose={toggleLoginVisibility}
            redirectDes={`/problems/${id}`} 
            isOpen={false}
          />
        )}
      </AnimatePresence>
    </div>
    );
  }

  return (
    <>
    <header>
      <title>{problem?.title || t('problemTitle')}</title>
    </header>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh)] flex-1"
    >
      <WaitingModal message={t('loading')} open={false} isOpen={loading} onOpenChange={() => {}}>
        <div>{t('loading')}</div>
      </WaitingModal>
      
      {hasAccess && !loading && (
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="h-full w-full"
        >
          {/* Problem Description Panel */}
          <ResizablePanel defaultSize={50} style={getPanelStyle(1)}>
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-full">
                  <DotsLoader size={12} />
                </div>
              }
            >
              <ProblemDescription
                problemId={id}
                user={user}
                title={problem?.title || t('untitled')}
                difficulty={problem?.difficulty || 1}
                description={problem?.description || ""}
                categories={problem?.categories || []}
                solutionDescription={problem?.solution || ""}
                selectedTab={selectedTab}
                onSubmissionClick={onClickSubmission}
                onTabChange={(tab) => setSelectedTab(tab)}
                displaySubmission={displaySubmission}
              />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle />
          
          {/* Editor/Submission Panel */}
          <ResizablePanel defaultSize={50} style={getPanelStyle(2)}>
            <AnimatePresence mode="wait">
              {displaySubmission ? (
                <Submission
                  problemTitle={problem?.title || t('untitled')}
                  submissionId={displaySubmission}
                  setDisplaySubmission={setDisplaySubmission}
                />
              ) : (
                <CodeEditor
                  problemId={id}
                  user={user}
                  onTabChange={setSelectedTab}
                  setDisplaySubmission={setDisplaySubmission}
                />
              )}
            </AnimatePresence>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginVisible && (
          <Login
            onClose={toggleLoginVisibility}
            redirectDes={`/problems/playground/${id}`} 
            isOpen={false}
          />
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}