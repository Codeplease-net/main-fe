import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Problem } from '../utils/types';
import { fetchProblemById } from '../api/problem';
import { useAuth } from '@/components/auth/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/api/Readfirebase';

export function useProblem(id: string) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const locale = useLocale();
  const { user, userRole } = useAuth();

  useEffect(() => {
    async function loadProblem() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch problem data
        const result = await fetchProblemById(id);
        if (!result) {
          throw new Error("Problem not found");
        }

        // Check permission
        const isAdmin = userRole === 'admin';
        const isProblemSetter = userRole === 'problem-setter';
        const isOwner = isProblemSetter && user?.uid === result.owner;
        
        // Check if problem is public
        const permissionRef = doc(db, 'problem-permissions', id);
        const permissionDoc = await getDoc(permissionRef);
        const isPublic = permissionDoc.exists() && permissionDoc.data()?.public === true;
        
        // Determine access
        const userHasAccess = isPublic || isAdmin || isOwner;
        setHasAccess(userHasAccess);
        
        if (!userHasAccess) {
          setError("You don't have permission to access this problem");
          setTimeout(() => setLoading(false), 1000);
          return;
        }

        // Set problem data
        setProblem({
          id,
          categories: result.categories,
          difficulty: result.difficulty,
          acceptance: result.acceptance,
          title: result.title[locale],
          description: result.description[locale],
          solution: result.solution[locale],
          owner: result.owner,
        });
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError(err instanceof Error ? err.message : "Failed to load problem");
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }

    if (id) {
      loadProblem();
    }
  }, [id, locale, user, userRole]);

  return { problem, loading, error, hasAccess };
}