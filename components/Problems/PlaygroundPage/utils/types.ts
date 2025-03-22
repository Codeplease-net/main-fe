export interface TestCase {
    result: "IQ" | "AC" | "WA" | "TLE" | "RTE" | "CE";
    time_used: number;
    memory_used: number;
    status?: string;
    categories: string[]
  }
  
  export interface SubmissionDetailProps {
    _id: string;
    language: "c" | "cpp11" | "cpp14" | "cpp17" | "cpp20" | "python2" | "python3" | "java";
    test_cases: TestCase[];
    test_count: number;
    result: "IQ" | "AC" | "WA" | "TLE" | "RTE" | "CE";
    timestamp: number;
    user: string;
    source: string;
    error_output?: string;
    id?: string;
    problem: string;
  }
  
  export interface Problem {
    id: string;
    title: string;
    categories: string[];
    difficulty: number;
    acceptance: number;
    description: string;
    solution: string;
    owner: string;
  }
  
  export interface SubmissionsTabProps {
    displaySubmission: string | undefined;
    onSubmissionClick: (submissionId: string) => void;
  }
  
  export interface ProblemDescriptionProps {
    title: string;
    difficulty: number;
    description: string;
    categories: string[];
    selectedTab: string;
    solutionDescription: string;
    displaySubmission: string | undefined;
    onSubmissionClick: (submission: SubmissionDetailProps) => void;
    onTabChange: (e: string) => void;
  }