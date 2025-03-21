"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Problem } from "../types/problem";
import { LanguageCode } from "../types/language";
import { FileCode, FileText } from "lucide-react";
import { useTranslations } from "next-intl"; // Import useTranslations
import { TabsContent } from "@radix-ui/react-tabs";
import Spinner from "@/components/ui/spinner";
import { CategoryBadge } from "@/components/Problems/ProblemsetPage/components/CategoryBadges";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";

interface OutputSectionProps {
  problem: Problem;
  lang: LanguageCode;
}

export function OutputSection({ problem, lang }: OutputSectionProps) {
  // Get translations
  const t = useTranslations("ProblemBank.problem.outputSection");
  
  const [previewTab, setPreviewTab] = useState<"description" | "solution">(
    "description"
  );
  const [content, setContent] = useState(problem.content);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      setContent(problem.content);
      setLoading(false)
    }, 1.5 * (problem.content.description[lang].length * (previewTab == "description" ? 1 : 0) + problem.content.solution[lang].length * (previewTab == "solution" ? 1 : 0)));

    return () => {
      clearTimeout(handler);
    };
  }, [problem.content]);

  return (
    <Card className="h-full border-none rounded-none shadow-none">
      <CardContent className="p-0">
        <Tabs
          value={previewTab}
          onValueChange={(value) => setPreviewTab(value as typeof previewTab)}
          className="h-full flex flex-col"
        >
          <TabsList className="h-16 px-4 bg-background border-b flex items-center gap-4 rounded-none">
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
              value="solution"
              className="group relative p-2 data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors gap-2 rounded-lg"
            >
              
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-muted-foreground group-data-[state=active]:text-primary" />
                <span className="font-medium text-muted-foreground group-data-[state=active]:text-primary">
                  {t("tabs.solution")}
                </span>
              </div>
              <div className="absolute bottom-[-0.75rem] inset-x-0 h-1 bg-primary transition-opacity opacity-0 group-data-[state=active]:opacity-100" />
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="description"
            className="flex-grow overflow-auto bg-background"
          >
            {loading && (
              <div className="w-full h-[calc(100vh-9rem)] inset-0 flex items-center justify-center bg-opacity-75 z-10">
                <Spinner />
              </div>
            )}
            {!loading && (
              <div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto bg-dot-pattern p-6">
                <h1 className="text-2xl font-bold mb-2">{content.title[lang]}</h1>
                <div className="flex items-center gap-2 mb-4">
                  {problem.categories.map((category) => (
                    <CategoryBadge key={category} category={category} />
                  ))}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <RenderMathJaxText content={content.description[lang]} />
                </div>
              </div>
            )}
            
          </TabsContent>

          <TabsContent
            value="solution"
            className="flex-grow overflow-auto bg-background"
          >
            {loading && (
              <div className="w-full h-[calc(100vh-4rem)] inset-0 flex items-center justify-center bg-opacity-75 z-10">
              <Spinner />
            </div>
            )}
             {!loading && (<div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto bg-dot-pattern p-6">
              <h1 className="text-2xl font-bold mb-2">{t("solutionFor")} {content.title[lang]}</h1>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <RenderMathJaxText content={content.solution[lang]} />
              </div>
            </div>)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}