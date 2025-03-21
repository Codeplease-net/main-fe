import axios from "axios";
import { SubmissionDetailProps } from "../utils/types";

type languageType = "c" | "cpp11" | "cpp14" | "cpp17" | "cpp20" | "python2" | "python3" | "java";

export async function submitCode(problemId: string, code: string, userId: string, language: languageType) {
  try {
    const form = new FormData();
    form.append('source', code)
    form.append('language', language)
    form.append('problem', problemId)
    form.append('user', userId)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/submit/submit`,
      form
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
}

export async function fetchSubmission(submissionId: string): Promise<SubmissionDetailProps> {
  try {
    const form = new FormData();
    form.append("id", submissionId);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/database/query`,
      form
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw error;
  }
}

export async function fetchSubmissions(page: number, itemsPerPage: number) {
  try {
    const form = new FormData();
    form.append("start", ((page - 1) * itemsPerPage + 1).toString());
    form.append("end", (page * itemsPerPage).toString());
    form.append("user", "");
    form.append("result", "");
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/database/list_from_start_to_end`,
      form
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}