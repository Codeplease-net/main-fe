import { useState, useEffect } from 'react';
import { SubmissionDetailProps } from '../utils/types';
import { fetchSubmission, fetchSubmissions } from '../api/submission';

export function useSubmission(submissionId?: string) {
  const [submission, setSubmission] = useState<SubmissionDetailProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) {
      setLoading(false);
      return;
    }

    async function loadSubmission() {
      try {
        if (typeof submissionId === 'string') {
          const data = await fetchSubmission(submissionId);
          setSubmission(data);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

  return { submission, loading };
}

export function useSubmissionsList() {
  const [submissions, setSubmissions] = useState<SubmissionDetailProps[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadSubmissions = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchSubmissions(page, ITEMS_PER_PAGE);
      setSubmissions(data);
      // We might need to adjust this based on actual API response for pagination
      setTotalPages(Math.ceil((data?.length || 0) / ITEMS_PER_PAGE) || 1);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return {
    submissions,
    loading,
    currentPage,
    totalPages,
    handlePageChange
  };
}