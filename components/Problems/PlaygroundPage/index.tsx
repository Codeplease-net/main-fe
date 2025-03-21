"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

// Firebase imports
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// UI Components
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Custom Components
import Login from "@/components/login";
import { WaitingModal } from "../../ui/modal";
import ProblemDescription from "./components/ProblemDescription";
import CodeEditor from "./components/CodeEditor";
import Submission from "./components/Submission/Submission";
import DotsLoader from "./components/DotsLoader";

// Utilities & Types
import { Problem } from "./utils/types";
import { fetchProblemById } from "./api/problem";

export default function PlaygroundComponent({ id, tab, searchParams }: { tab: string, id: string, searchParams: { [key: string]: string | undefined }}) {
  
  // Tab state - initialize from URL path tab parameter
  const [selectedTab, setSelectedTabState] = useState<string>(tab || "description");
  
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

  // Problem data state
  const [problem, setProblem] = useState<Problem | null>(null);

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
  const [waiting, setWaiting] = useState(true);
  
  // Current locale for i18n
  const locale = useLocale();

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

  // Fetch problem data effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchProblemById(id);
        if (!result) {
          throw new Error("Problem not found");
        }

        setProblem({
          id,
          categories: result.categories,
          difficulty: result.difficulty,
          acceptance: result.acceptance,
          title: result.title[locale],
          description: result.description[locale],
          solution: result.solution[locale],
        });
      } catch (err) {
        console.error("Error fetching problem:", err);
      } finally {
        setWaiting(false);
      }
    };

    fetchData();
  }, [id, locale]);

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

  return (
    <>
    <header>
      <title>{problem?.title}</title>
    </header>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh)] flex-1"
    >
      <WaitingModal open={false} isOpen={waiting} onOpenChange={setWaiting}>
        <div>Loading...</div>
      </WaitingModal>
      
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
              title={problem?.title || ""}
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
                problemTitle={problem?.title || ""}
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

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginVisible && (
          <Login
              onClose={toggleLoginVisibility}
              redirectDes={`/problems/playground/${id}`} isOpen={false}          />
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}