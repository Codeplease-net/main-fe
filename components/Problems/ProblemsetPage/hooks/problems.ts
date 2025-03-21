import { useState, useCallback } from 'react';
import { Problem, ProblemFilters } from '../types/interfaces';
import { getProblems } from '../utils/firebase';

export function useProblems(userId: string | null) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [isLoading, setIsLoading] = useState(true); 

  const fetchProblems = useCallback(async (filters: ProblemFilters) => {
    setIsLoading(true);
    try {
      const result = await getProblems(userId, filters);
      if (result.notFound) {
        throw new Error("Problems not found");
      }
      setProblems(result.problems);
      setTotalProblems(result.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { problems, totalProblems, isLoading, fetchProblems };
}