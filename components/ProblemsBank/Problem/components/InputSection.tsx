import { Beaker, FileText, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Problem } from "../types/problem";
import { LanguageCode } from "../types/language";
import { GeneralTab } from "./GeneralTab";
import { DescriptionTab } from "./DescriptionTab";
import { TestcasesTab } from "./TestcasesTab";
import { useState } from "react";
import { useTranslations } from "next-intl"; // Import useTranslations

interface InputSectionProps {
  problem: Problem;
  isLoading: boolean;
  onUpdateProblem: (updates: Partial<Problem>) => Promise<void>;
  language: LanguageCode;
  onPreviewChange: (
    content: { title: string; description: string; solution: string },
    lang: LanguageCode
  ) => void;
}

export function InputSection({
  problem,
  isLoading,
  language,
  onUpdateProblem,
  onPreviewChange,
}: InputSectionProps) {
  // Get translations
  const t = useTranslations("ProblemBank.problem.inputSection");
  
  const [activeTab, setActiveTab] = useState<
    "general" | "description" | "testcases"
  >("general");

  return (
    <Card className="h-full border-none rounded-none shadow-none">
      <CardContent className="p-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="h-full flex flex-col"
        >
          <TabsList className="h-16 px-4 bg-background border-b flex items-center gap-4 rounded-none">
            <TabsTrigger
              value="general"
              className="group relative p-2 data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors gap-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-muted-foreground group-data-[state=active]:text-primary" />
                <span className="font-medium text-muted-foreground group-data-[state=active]:text-primary">
                  {t("tabs.general")}
                </span>
              </div>
              <div className="absolute bottom-[-0.75rem] inset-x-0 h-1 bg-primary transition-opacity opacity-0 group-data-[state=active]:opacity-100" />
            </TabsTrigger>

            <TabsTrigger
              value="description"
              className="group relative p-2 data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors gap-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground group-data-[state=active]:text-primary" />
                <span className="font-medium text-muted-foreground group-data-[state=active]:text-primary">
                  {t("tabs.description")}
                </span>
              </div>
              <div className="absolute bottom-[-0.75rem] inset-x-0 h-1 bg-primary transition-opacity opacity-0 group-data-[state=active]:opacity-100" />
            </TabsTrigger>
            <TabsTrigger
              value="testcases"
              className="group relative p-2 data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors gap-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-muted-foreground group-data-[state=active]:text-primary" />
                <span className="font-medium text-muted-foreground group-data-[state=active]:text-primary">
                  {t("tabs.testcases")}
                </span>
              </div>
              <div className="absolute bottom-[-0.75rem] inset-x-0 h-1 bg-primary transition-opacity opacity-0 group-data-[state=active]:opacity-100" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-grow bg-background">
            <GeneralTab
              problem={problem}
              isLoading={isLoading}
              onUpdate={onUpdateProblem}
            />
          </TabsContent>

          <TabsContent
            value="description"
            className="overflow-auto bg-background"
          >
            <DescriptionTab
              onPreviewChange={onPreviewChange}
              problem={problem}
              language={language}
              isLoading={isLoading}
              onUpdate={onUpdateProblem}
            />
          </TabsContent>
          <TabsContent
            value="testcases"
            className="overflow-auto bg-background"
          >
            <TestcasesTab problemId={problem?.id ? problem.id : "breed-counting"}/>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}