import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { ChevronDown, ChevronUp, CopyIcon, CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface Environment {
  name: string;
  description: string;
  syntax: string;
  example: string;
  notes: string;
}

const EnvironmentExample = ({ env, t }: { env: Environment, t: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = ({ text }: { text: string }): void => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="p-4 border-b bg-muted flex items-center justify-between">
        <div>
          <h3 className="font-mono text-primary font-medium">
            \begin{`{${env.name}}`}...\end{`{${env.name}}`}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{env.description}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium mb-2">{t("basicSyntax")}:</h4>
          <div className="relative">
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {env.syntax}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => copyToClipboard({ text: env.syntax })}
            >
              {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{env.notes}</p>
        </div>
      )}

      {isExpanded && (
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">{t("exampleCode")}:</h4>
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {env.example}
            </pre>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard({ text: env.example })}
              className="mt-2"
            >
              {copied ? <CheckIcon className="h-4 w-4 mr-1" /> : <CopyIcon className="h-4 w-4 mr-1" />}
              {copied ? t("copied") : t("copyExample")}
            </Button>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">{t("renderedResult")}:</h4>
            <div className="border p-3 rounded min-h-[150px] bg-card overflow-auto">
              <RenderMathJaxText content={env.example} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export const EnvironmentsList: React.FC = () => {
  const t = useTranslations("MathJax.environments");
  
  // Get the environmentCategories from translations and ensure it's an array
  const environmentCategories = t.raw("categories") || [];
  const categories = Array.isArray(environmentCategories) ? environmentCategories : [];

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
      <p className="mb-6">
        {t.rich("description", {
          beginCode: (chunks) => <code>\begin{'{name}'}</code>,
          endCode: (chunks) => <code>\end{'{name}'}</code>
        })}
      </p>

      {/* Simple Navigation Menu */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium mb-3">{t("jumpToCategory")}:</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category: any) => (
            <a 
              key={category.name}
              href={`#${category.name.toLowerCase()}`} 
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-md text-sm transition-colors"
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      {/* Category Sections */}
      {categories.map((category: any) => (
        <section 
          key={category.name} 
          id={category.name.toLowerCase()} 
          className="mb-12 scroll-mt-20"
        >
          <div className="mb-4 pb-2 border-b">
            <h3 className="text-xl font-medium">{category.name} {t("environmentsLabel")}</h3>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="space-y-4">
            {category.environments && Array.isArray(category.environments) &&
              category.environments.map((env: Environment) => (
                <EnvironmentExample key={env.name} env={env} t={t} />
              ))}
          </div>

          {category.name === "Tables" && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2">{t("tables.formatTipsTitle")}:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {t.rich("tables.formatTips", {
                  columnFormat: () => <li><strong>{t("tables.columnFormatting")}:</strong> {t.rich("tables.columnFormatDesc", {
                    code1: (chunks) => <code>{chunks}</code>,
                    code2: (chunks) => <code>{chunks}</code>,
                    code3: (chunks) => <code>{chunks}</code>,
                    code4: (chunks) => <code>{chunks}</code>,
                    code5: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  rowEndings: () => <li><strong>{t("tables.rowEndings")}:</strong> {t.rich("tables.rowEndingsDesc", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  cellSeparator: () => <li><strong>{t("tables.cellSeparator")}:</strong> {t.rich("tables.cellSeparatorDesc", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  horizontalLines: () => <li><strong>{t("tables.horizontalLines")}:</strong> {t.rich("tables.horizontalLinesDesc", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  multiColumn: () => <li><strong>{t("tables.multiColumn")}:</strong> {t.rich("tables.multiColumnDesc", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  alignDecimal: () => <li><strong>{t("tables.alignDecimal")}:</strong> {t.rich("tables.alignDecimalDesc", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>
                })}
              </ul>
            </div>
          )}

          {category.name === "Code" && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2">{t("code.bestPracticesTitle")}:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {t.rich("code.bestPractices", {
                  chooseLanguage: () => <li>{t.rich("code.chooseLanguage", {
                    cpp: (chunks) => <code>{chunks}</code>,
                    java: (chunks) => <code>{chunks}</code>,
                    python: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  preserveIndentation: () => <li>{t("code.preserveIndentation")}</li>,
                  avoidBackslash: () => <li>{t.rich("code.avoidBackslash", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>,
                  combineCodeBlocks: () => <li>{t.rich("code.combineCodeBlocks", {
                    code: (chunks) => <code>{chunks}</code>
                  })}</li>
                })}
              </ul>
            </div>
          )}
          
        </section>
      ))}

      <div className="p-4 bg-accent/10 mt-6 rounded-lg">
        <h3 className="font-medium mb-2">{t("nesting.title")}</h3>
        <p className="mb-4">{t("nesting.description")}</p>
        <Card className="overflow-hidden">
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">{t("example")}:</h4>
            <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap mb-2">
              {t.raw("nesting.exampleCode")}
            </pre>
            <div className="border p-3 rounded bg-card">
              <RenderMathJaxText content={t.raw("nesting.exampleCode")} />
            </div>
          </div>
        </Card>
        <p className="mt-4 text-sm text-muted-foreground">
          <strong>{t("important")}:</strong> {t("nesting.warning")}
        </p>
      </div>
    </div>
  );
};

export default EnvironmentsList;
