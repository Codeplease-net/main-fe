import React from 'react';
import { Card } from "@/components/ui/card";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle, X, ArrowRight, FunctionSquare } from "lucide-react";
import { FileText, Table, HelpCircle, Type } from "lucide-react";
import { useTranslations } from "next-intl";

// Helper component for showing examples
const ExampleCard = ({ title, code, description }: { title: string; code: string; description?: string }) => {
  const t = useTranslations("MathJax.bestPractices.commonUI");
  
  return (
    <Card className="mb-6 overflow-hidden border border-border">
      <div className="p-4 bg-muted border-b border-border">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <span className="mr-1">{t("code")}</span>
          </h4>
          <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
            {code}
          </pre>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-medium mb-2">{t("renderedResult")}</h4>
          <div className="border border-border p-3 rounded bg-card overflow-x-auto">
            <RenderMathJaxText content={code} />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Example comparisons (good vs bad)
const ComparisonExample = ({ title, goodCode, badCode, explanation }: { title: string; goodCode: string; badCode: string; explanation: string }) => {
  const t = useTranslations("MathJax.bestPractices.commonUI");
  
  return (
    <div className="mb-6">
      <h3 className="font-medium text-base mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border border-success/30 overflow-hidden">
          <div className="p-3 bg-success/10 border-b flex items-center">
            <Check className="h-4 w-4 text-success mr-2" />
            <h4 className="text-sm font-medium">{t("recommended")}</h4>
          </div>
          <div className="p-4 space-y-3">
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {goodCode}
            </pre>
            <div className="border border-border p-3 rounded bg-card overflow-x-auto">
              <RenderMathJaxText content={goodCode} />
            </div>
          </div>
        </Card>

        <Card className="border border-destructive/30 overflow-hidden">
          <div className="p-3 bg-destructive/10 border-b flex items-center">
            <X className="h-4 w-4 text-destructive mr-2" />
            <h4 className="text-sm font-medium">{t("avoid")}</h4>
          </div>
          <div className="p-4 space-y-3">
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {badCode}
            </pre>
            <div className="border border-border p-3 rounded bg-card overflow-x-auto">
              <RenderMathJaxText content={badCode} />
            </div>
          </div>
        </Card>
      </div>
      <p className="text-sm mt-3 text-muted-foreground">{explanation}</p>
    </div>
  );
};

export const BestPractices: React.FC = () => {
  const t = useTranslations("MathJax.bestPractices");
  
  return (
    <div className="space-y-8 mt-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="w-full h-auto flex flex-wrap mb-0 gap-x-1 gap-y-2 bg-transparent p-0">
          {[
            { value: "structure", icon: FileText, label: t("tabs.structure") },
            { value: "tables", icon: Table, label: t("tabs.tables") },
            { value: "math", icon: FunctionSquare, label: t("tabs.math") },
            { value: "troubleshooting", icon: HelpCircle, label: t("tabs.troubleshooting") },
            { value: "formatting", icon: Type, label: t("tabs.formatting") }
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border  
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                data-[state=active]:border-primary data-[state=active]:shadow-sm
                hover:bg-muted/30 transition-all font-medium min-w-[140px] justify-center"
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="mt-4 p-6 border border-border rounded-md shadow-sm">
          <TabsContent value="structure" className="m-0">
            <h3 className="text-lg font-medium">{t("structure.title")}</h3>
            <ComparisonExample
              title={t("structure.example1.title")}
              goodCode={t("structure.example1.goodCode")}
              badCode={t("structure.example1.badCode")}
              explanation={t("structure.example1.explanation")}
            />

            <ComparisonExample
              title={t("structure.example2.title")}
              goodCode={t("structure.example2.goodCode")}
              badCode={t("structure.example2.badCode")}
              explanation={t("structure.example2.explanation")}
            />

            <ExampleCard
              title={t("structure.example3.title")}
              code={t("structure.example3.code")}
              description={t("structure.example3.description")}
            />

            <ExampleCard
              title={t("structure.example4.title")}
              code={t("structure.example4.code")}
              description={t("structure.example4.description")}
            />

            <ExampleCard
              title={t("structure.example5.title")}
              code={t("structure.example5.code")}
              description={t("structure.example5.description")}
            />
          </TabsContent>
          
          <TabsContent value="tables" className="m-0">
            <h3 className="text-lg font-medium">{t("tables.title")}</h3>

            <ExampleCard
              title={t("tables.example1.title")}
              code={t("tables.example1.code")}
              description={t("tables.example1.description")}
            />

            <ExampleCard
              title={t("tables.example2.title")}
              code={t("tables.example2.code")}
              description={t("tables.example2.description")}
            />

            <ExampleCard
              title={t("tables.example3.title")}
              code={t("tables.example3.code")}
              description={t("tables.example3.description")}
            />

            <ComparisonExample
              title={t("tables.example4.title")}
              goodCode={t("tables.example4.goodCode")}
              badCode={t("tables.example4.badCode")}
              explanation={t("tables.example4.explanation")}
            />

            <ExampleCard
              title={t("tables.example5.title")}
              code={t("tables.example5.code")}
              description={t("tables.example5.description")}
            />
          </TabsContent>
          
          <TabsContent value="math" className="m-0">
            <h3 className="text-lg font-medium">{t("math.title")}</h3>

            <ComparisonExample
              title={t("math.example1.title")}
              goodCode={t("math.example1.goodCode")}
              badCode={t("math.example1.badCode")}
              explanation={t("math.example1.explanation")}
            />

            <ExampleCard
              title={t("math.example2.title")}
              code={t("math.example2.code")}
              description={t("math.example2.description")}
            />

            <ExampleCard
              title={t("math.example3.title")}
              code={t("math.example3.code")}
              description={t("math.example3.description")}
            />

            <ExampleCard
              title={t("math.example4.title")}
              code={t("math.example4.code")}
              description={t("math.example4.description")}
            />

            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>{t("math.performanceTips.title")}</AlertTitle>
              <AlertDescription>
                {t("math.performanceTips.description")}
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="troubleshooting" className="m-0">
            <h3 className="text-lg font-medium">{t("troubleshooting.title")}</h3>

            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-2">{t("troubleshooting.problem1.title")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">{t("troubleshooting.incorrect")}</div>
                  <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto">
                    {t("troubleshooting.problem1.incorrectCode")}
                  </pre>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-success">{t("troubleshooting.fix")}</div>
                  <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto">
                    {t("troubleshooting.problem1.fixCode")}
                  </pre>
                  <div className="text-sm text-muted-foreground">
                    {t("troubleshooting.problem1.explanation")}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-2">{t("troubleshooting.problem2.title")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">{t("troubleshooting.incorrect")}</div>
                  <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto">
                    {t("troubleshooting.problem2.incorrectCode")}
                  </pre>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-success">{t("troubleshooting.fix")}</div>
                  <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto">
                    {t("troubleshooting.problem2.fixCode")}
                  </pre>
                  <div className="text-sm text-muted-foreground">
                    {t("troubleshooting.problem2.explanation")}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-2">{t("troubleshooting.problem3.title")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">{t("troubleshooting.incorrect")}</div>
                  <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto">
                    {t("troubleshooting.problem3.incorrectCode")}
                  </pre>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-success">{t("troubleshooting.fix")}</div>
                  <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto">
                    {t("troubleshooting.problem3.fixCode")}
                  </pre>
                  <div className="text-sm text-muted-foreground">
                    {t("troubleshooting.problem3.explanation")}
                  </div>
                </div>
              </div>
            </Card>

            <Alert className="bg-primary/10 border-primary/20 mb-4">
              <AlertTitle>{t("commonUI.debuggingTip")}</AlertTitle>
              <AlertDescription>
                {t("troubleshooting.debuggingTip")}
              </AlertDescription>
            </Alert>

            <Alert className="my-4 border-amber-200">
              <AlertTitle>{t("commonUI.performanceTips")}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{t("troubleshooting.performanceTipsIntro")}</p>
                <ul className="list-disc pl-5 space-y-1">
                  {t("troubleshooting.performanceTipsList").split("\n").map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            <div className="mt-6">
              <h3 className="font-medium mb-3">{t("troubleshooting.syntaxReminders.title")}</h3>
              <ul className="list-disc pl-5 space-y-3">
                {t("troubleshooting.syntaxReminders.items").split("\n").map((item, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="formatting" className="m-0">
            <h3 className="text-lg font-medium">{t("formatting.title")}</h3>
            
            <ExampleCard
              title={t("formatting.example1.title")}
              code={t("formatting.example1.code")}
              description={t("formatting.example1.description")}
            />
            
            <ExampleCard
              title={t("formatting.example2.title")}
              code={t("formatting.example2.code")}
              description={t("formatting.example2.description")}
            />
            
            <ComparisonExample
              title={t("formatting.example3.title")}
              goodCode={t("formatting.example3.goodCode")}
              badCode={t("formatting.example3.badCode")}
              explanation={t("formatting.example3.explanation")}
            />
          </TabsContent>
        </div>
      </Tabs>

      <div className="bg-accent/10 p-6 rounded-lg mt-8">
        <h3 className="text-lg font-medium mb-4">{t("advancedTips.title")}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 h-full">
            <h4 className="font-medium mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              {t("advancedTips.nesting.title")}
            </h4>
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto mb-3">
              {t("advancedTips.nesting.code")}
            </pre>
            <p className="text-sm text-muted-foreground">
              {t("advancedTips.nesting.description")}
            </p>
          </Card>

          <Card className="p-4 h-full">
            <h4 className="font-medium mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              {t("advancedTips.details.title")}
            </h4>
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto mb-3">
              {t("advancedTips.details.code")}
            </pre>
            <p className="text-sm text-muted-foreground">
              {t("advancedTips.details.description")}
            </p>
          </Card>

          <Card className="p-4 h-full">
            <h4 className="font-medium mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              {t("advancedTips.formatting.title")}
            </h4>
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto mb-3">
              {t("advancedTips.formatting.code")}
            </pre>
            <p className="text-sm text-muted-foreground">
              {t("advancedTips.formatting.description")}
            </p>
          </Card>

          <Card className="p-4 h-full">
            <h4 className="font-medium mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              {t("advancedTips.code.title")}
            </h4>
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto mb-3">
              {t("advancedTips.code.code")}
            </pre>
            <p className="text-sm text-muted-foreground">
              {t("advancedTips.code.description")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;