"use client";

import { useState, useCallback, useEffect } from "react";
import { Problem, ProblemState, defaultProblem } from "../types/problem";
import { LanguageCode } from "../types/language";
import { fetchProblemById, updateProblem } from "../api/problemApi";
import { useAuth } from "@/components/auth/hooks/useAuth"; // Import useAuth hook

interface PreviewContent {
  title: string;
  description: string;
  solution: string;
}

interface UseProblemReturn {
  problem: Problem;
  preview: Problem;
  state: ProblemState & {
    hasAccess: boolean;
    isOwner: boolean;
    loadingAcceess: boolean;
  };
  actions: {
    searchProblem: (id: string) => Promise<void>;
    updateProblem: (updates: Partial<Problem>) => Promise<void>;
    updateContent: (
      lang: LanguageCode,
      content: Partial<Problem["content"]>
    ) => Promise<void>;
    updatePreview: () => void;
    onPreviewChange: (content: PreviewContent, lang: LanguageCode) => void;
  };
}

function generateSearchableTerms(title: string): string[] {
  const terms = [];
  const normalizedTitle = title.toLowerCase();

  // Generate all possible substrings
  for (let i = 0; i < normalizedTitle.length; i++) {
    for (let j = i + 1; j <= normalizedTitle.length; j++) {
      terms.push(normalizedTitle.slice(i, j));
    }
  }

  return Array.from(new Set(terms)); // Remove duplicates
}

export function useProblem(): UseProblemReturn {
  const [problem, setProblem] = useState<Problem>(defaultProblem);
  const [preview, setPreview] = useState<Problem>(defaultProblem);
  const [state, setState] = useState<ProblemState & {
    hasAccess: boolean;
    isOwner: boolean;
    loadingAcceess: boolean;
  }>({
    loadingAcceess: true,
    isLoading: false,
    isDone: false,
    hasAccess: false,
    isOwner: false,
  });
  
  // Get user auth information
  const { user, userRole } = useAuth(); // Assuming roles is an object with role names as keys

  // Check user permissions when problem or user changes
  useEffect(() => {
    console.log("Auth data:", { 
      user: user?.uid, 
      problemOwner: problem.owner,
      userRole, 
      problemId: problem.id 
    });
    
    if (!user || !problem.id) {
      console.log("Missing user or problem ID - denying access");
      setState(prev => ({ ...prev, hasAccess: false, isOwner: false }));
      return;
    }

    // Check if user is admin (adjust based on your actual roles structure)
    const isAdmin = userRole == 'admin';
    
    // Check if user is problem setter
    const isProblemSetter = userRole == 'problem-setter';
    
    // Check if user owns this problem
    const isOwner = problem.owner === user.uid;
    
    // Determine access based on roles and ownership
    const hasAccess = isAdmin || (isProblemSetter && isOwner);
    
    console.log("Access determination:", { isAdmin, isProblemSetter, isOwner, hasAccess });
    
    setState(prev => ({ ...prev, hasAccess, isOwner, loadingAcceess: false }));
  }, [user, problem, userRole]);

  const onPreviewChange = (content: PreviewContent, lang: LanguageCode) => {
    setPreview((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        title: { ...prev.content.title, [lang]: content.title },
        description: {
          ...prev.content.description,
          [lang]: content.description,
        },
        solution: { ...prev.content.solution, [lang]: content.solution },
      },
    }));
  };

  const updatePreview = useCallback(() => {
    setPreview(problem);
  }, [problem]);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const searchProblem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const result = await fetchProblemById(id);
      if (result) {
        setProblem(result.data as Problem);
        setPreview(result.data as Problem);
      }
    } catch (error) {
      console.error("Error fetching problem:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProblemData = useCallback(
    async (updates: Partial<Problem>) => {
      // Check if user has permission to update
      if (!state.hasAccess) {
        console.error("Permission denied: You don't have access to update this problem");
        return;
      }

      try {
        setLoading(true);
        let updatesWithSearchTerms = { ...updates };
        let searchTerms: string[] = [];

        // Add displayTitle terms if available
        if (updates.displayTitle) {
          searchTerms = [
            ...searchTerms,
            ...generateSearchableTerms(updates.displayTitle),
          ];
        }

        // Add terms from all language versions of the title if available
        if (updates.content?.title) {
          // English title
          if (updates.content.title.en) {
            searchTerms = [
              ...searchTerms,
              ...generateSearchableTerms(updates.content.title.en),
            ];
          }

          // Vietnamese title
          if (updates.content.title.vi) {
            searchTerms = [
              ...searchTerms,
              ...generateSearchableTerms(updates.content.title.vi),
            ];
          }

          // Chinese title
          if (updates.content.title["zh-CN"]) {
            searchTerms = [
              ...searchTerms,
              ...generateSearchableTerms(updates.content.title["zh-CN"]),
            ];
          }
        }
        if (searchTerms.length > 0) {
          updatesWithSearchTerms.searchableTitle = Array.from(
            new Set(searchTerms)
          );
        }
        updatesWithSearchTerms.searchableTitle =
          searchTerms.length > 0 ? Array.from(new Set(searchTerms)) : [];
        await updateProblem(problem.id!, updatesWithSearchTerms);
        setProblem((prev) => ({ ...prev, ...updatesWithSearchTerms }));
      } catch (error) {
        console.error("Error updating problem:", error);
      } finally {
        setLoading(false);
      }
    },
    [problem?.id, state.hasAccess]
  );

  const updateContent = useCallback(
    async (lang: LanguageCode, content: Partial<Problem["content"]>) => {
      if (!problem.id || !state.hasAccess) return;

      const newContent = {
        ...problem.content,
        ...Object.entries(content).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: {
              ...problem.content[key as keyof Problem["content"]],
              [lang]: value,
            },
          }),
          {}
        ),
      };

      await updateProblemData({ content: newContent });
    },
    [problem, updateProblemData, state.hasAccess]
  );

  const actions = {
    searchProblem,
    updateProblem: updateProblemData,
    updateContent,
    updatePreview,
    onPreviewChange,
  };

  return { preview, problem, state, actions };
}