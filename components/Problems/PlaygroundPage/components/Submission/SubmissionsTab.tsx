import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// UI Components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DotsLoader } from "../DotsLoader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import { Filter, CheckCircle, Clock, Database, User, Eye } from "lucide-react";

// Utils
import { SubmissionDetailProps } from "@/components/Problems/PlaygroundPage/utils/types";
import {
  getTimeInHoursAndMinutesWithGMT,
  countAccepted,
  calculateTime,
  calculateMemory,
} from "@/components/Problems/PlaygroundPage/utils/formatters";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/api/Readfirebase";
import { User as UserFirebase } from "firebase/auth";
import {
  abbreviationToFull,
  FormalLang,
  langColors,
} from "@/components/Problems/PlaygroundPage/utils/constants";

interface SubmissionsTabProps {
  displaySubmission: string | undefined;
  onSubmissionClick: (submissionId: string) => void;
  problemId?: string;
  user: UserFirebase | null;
}

const statusColors = {
  AC: "bg-emerald-500",
  WA: "bg-rose-500",
  TLE: "bg-amber-500",
  RTE: "bg-red-500",
  MLE: "bg-purple-500",
  CE: "bg-gray-500",
};

export default function SubmissionsTab({
  displaySubmission,
  onSubmissionClick,
  problemId,
  user,
}: SubmissionsTabProps) {
  const t = useTranslations("Playground");
  const [filter, setFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [submissions, setSubmissions] = useState<SubmissionDetailProps[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionDetailProps[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 25; // Increased since table format allows for more items

  async function fetchUserHandle(userId: string): Promise<string> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return userId.slice(0, 8);
      }

      return userDoc.data()?.handle || userId.slice(0, 8);
    } catch (error) {
      console.error("Error fetching user handle:", error);
      return userId.slice(0, 8);
    }
  }

  const fetchAllSubmissions = async () => {
    try {
      const form = new FormData();
      form.append("start", "1");
      form.append("end", "100000");

      if (filter !== "All") {
        form.append("result", filter);
      }

      if (userFilter === "My" && user) {
        form.append("user", user.uid);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/database/list_from_start_to_end`,
        form
      );

      let filteredSubmissions = response.data;
      if (problemId) {
        filteredSubmissions = filteredSubmissions.filter(
          (sub: SubmissionDetailProps) => sub.problem === problemId
        );
      }

      setAllSubmissions(filteredSubmissions);
      setTotalPages(
        Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE) || 1
      );

      return filteredSubmissions;
    } catch (error) {
      console.error("Error fetching all submissions:", error);
      setError(t("failedToLoadSubmissions"));
      return [];
    }
  };

  const fetchSubmissions = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const filteredSubmissions = await fetchAllSubmissions();

      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      const pagedSubmissions = filteredSubmissions.slice(startIdx, endIdx);

      for (let i = 0; i < pagedSubmissions.length; i++) {
        const userHandle = await fetchUserHandle(pagedSubmissions[i].user);
        pagedSubmissions[i].user = userHandle;
      }

      setSubmissions(pagedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(t("failedToLoadSubmissions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage, filter, userFilter, problemId, user]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-background rounded-lg w-full">
      {/* Filters */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <Select onValueChange={setFilter}>
            <SelectTrigger className="gap-x-2 w-fit hover:bg-muted/70">
              <Filter className="text-gray-400" size={18} />
              <SelectValue placeholder={t("statusColumn")} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                <SelectLabel className="font-medium">
                  {t("statusColumn")}
                </SelectLabel>
                <SelectItem value="All">{t("all")}</SelectItem>
                <SelectItem value="AC">{t("status.accepted")}</SelectItem>
                <SelectItem value="WA">{t("status.wrongAnswer")}</SelectItem>
                <SelectItem value="TLE">{t("status.timeLimit")}</SelectItem>
                <SelectItem value="RTE">{t("status.runtime")}</SelectItem>
                <SelectItem value="MLE">{t("status.memoryLimit")}</SelectItem>
                <SelectItem value="CE">{t("status.compileError")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {user && (
            <Select
              value={userFilter}
              onValueChange={setUserFilter}
              disabled={!user}
            >
              <SelectTrigger className="gap-x-2 w-fit hover:bg-muted/70">
                <User className="text-gray-400" size={18} />
                <SelectValue placeholder={t("submissions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="font-medium">
                    {t("submissions")}
                  </SelectLabel>
                  <SelectItem value="All">{t("allSubmissions")}</SelectItem>
                  <SelectItem value="My">{t("mySubmissions")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => fetchSubmissions(1)}>
          {t("refresh")}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-destructive bg-destructive/10 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* No submissions message */}
      {!loading && submissions.length === 0 && !error && (
        <div className="text-center py-12 border border-dashed border-muted-foreground/20 rounded-lg">
          <p className="text-muted-foreground">{t("noSubmissionsFound")}</p>
        </div>
      )}

      {/* Submissions Table */}
      {!loading && submissions.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">{t("statusColumn")}</TableHead>
                <TableHead>{t("userColumn")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("whenColumn")}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("languageColumn")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("performanceColumn")}
                </TableHead>
                <TableHead className="w-[60px] text-right">
                  {t("viewColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow
                  key={submission._id}
                  className={
                    displaySubmission === submission._id
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/60"
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          statusColors[
                            submission.result as keyof typeof statusColors
                          ]
                        }`}
                      ></span>
                      <span className="font-medium">
                        {submission.result === "CE"
                          ? "CE"
                          : `${countAccepted(submission.test_cases)} / ${
                              submission.test_count
                            }`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{submission.user}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {getTimeInHoursAndMinutesWithGMT(submission.timestamp)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span
                      className={`text-xs px-2 py-1 rounded-sm ${
                        langColors[submission.language]?.bg || "bg-muted"
                      } ${
                        langColors[submission.language]?.text ||
                        "text-foreground"
                      }`}
                    >
                      {FormalLang[submission.language]}
                    </span>
                  </TableCell>{" "}
                  <TableCell className="hidden lg:table-cell">
                    {submission.result === "AC" ? (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {calculateTime(submission.test_cases)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-muted-foreground" />
                          {calculateMemory(submission.test_cases)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t(
                          `status.${
                            abbreviationToFull[
                              submission.result as keyof typeof abbreviationToFull
                            ]
                          }`
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={
                        displaySubmission === submission._id
                          ? "default"
                          : "ghost"
                      }
                      size="icon"
                      onClick={() => onSubmissionClick(submission._id)}
                      className="h-8 w-8"
                    >
                      {displaySubmission === submission._id ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-8"
          >
            <DotsLoader size={8} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4 mt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {t("previous")}
          </Button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
            ) {
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            } else if (
              pageNumber === currentPage - 3 ||
              pageNumber === currentPage + 3
            ) {
              return (
                <span key={pageNumber} className="px-2 self-center">
                  {t("ellipsis")}
                </span>
              );
            }
            return null;
          })}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
}
