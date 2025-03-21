import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

// UI Components
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// Components
import FormattedDescription from "./Description/FormattedDescription";
import FormattedSolution from "./Description/FormattedSolution";
import SubmissionsTab from "./Submission/SubmissionsTab";

// Icons
import {
  BookOpen,
  LightbulbIcon,
  ListChecks,
} from "lucide-react";
import { User } from "firebase/auth";

import Logo from '@/public/logo.png'
import Link from "next/link";

interface ProblemDescriptionProps {
  title: string;
  difficulty: number;
  description: string;
  categories: string[];
  selectedTab: string;
  solutionDescription: string;
  displaySubmission: string | undefined;
  user: User | null;
  problemId: string;
  onSubmissionClick: (submissionId: string) => void;
  onTabChange: (e: string) => void;
}

export default function ProblemDescription({
  problemId, 
  user,
  title,
  difficulty,
  description,
  categories,
  selectedTab,
  solutionDescription,
  displaySubmission,
  onSubmissionClick,
  onTabChange,
}: ProblemDescriptionProps) {
  const t = useTranslations("Playground");

  const tabs = [
    {
      id: "description",
      icon: <BookOpen className="w-5 h-5" />,
      label: t("Description"),
    },
    {
      id: "solution",
      icon: <LightbulbIcon className="w-5 h-5" />,
      label: t("Solution"),
    },
    {
      id: "submissions",
      icon: <ListChecks className="w-5 h-5" />,
      label: t("Submissions"),
    },
  ];

  return (
    <Card className="w-full h-full border-none shadow-none bg-background">
      <CardContent className="p-0 h-full flex flex-col">
        <Tabs
          value={selectedTab}
          onValueChange={onTabChange}
          className="h-full flex flex-col"
        >
          <TabsList className="h-16 px-4 bg-background border-b flex items-center gap-4 rounded-none">
            <div className="border-r py-3 pr-4 flex items-center gap-4">
              <Link href="/problems">
                <Image src={Logo} alt="Logo" width={32} height={32} />
              </Link>
            </div>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`group relative p-2 h-auto data-[state=active]:bg-transparent
                  hover:bg-muted/50 transition-colors gap-2 rounded-lg`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-muted-foreground transition-colors 
                    group-data-[state=active]:text-primary`}
                  >
                    {tab.icon}
                  </span>
                  <span
                    className={`font-medium text-muted-foreground
                    group-data-[state=active]:text-primary transition-colors`}
                  >
                    {tab.label}
                  </span>
                </div>
                <div
                  className={`absolute bottom-[-0.75rem] inset-x-0 h-1 bg-primary 
                  transition-opacity opacity-0 group-data-[state=active]:opacity-100`}
                />
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="description" className="p-4 h-full m-0">
                <FormattedDescription
                  content={description}
                  title={title}
                  difficulty={difficulty}
                  categories={categories}
                />
            </TabsContent>

            <TabsContent value="solution" className="p-6 h-full m-0">
                <FormattedSolution title={title} content={solutionDescription} />
            </TabsContent>

            <TabsContent value="submissions" className="p-6 h-full m-0">
                <SubmissionsTab
                  problemId={problemId}
                  user={user}
                  displaySubmission={displaySubmission}
                  onSubmissionClick={onSubmissionClick}
                />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}