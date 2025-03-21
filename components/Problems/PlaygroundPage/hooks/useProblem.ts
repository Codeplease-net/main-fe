import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Problem } from '../utils/types';
import { fetchProblemById } from '../api/problem';

export function useProblem(id: string) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    async function loadProblem() {
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
        setLoading(false);
      }
    }

    loadProblem();
  }, [id, locale]);

  return { problem, loading };
}