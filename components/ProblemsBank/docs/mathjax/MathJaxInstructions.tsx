import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { Badge } from "@/components/ui/badge";
import { createAnnotatedExample } from "./components/ExampleTab";
import { MdContentCopy, MdDone, MdArrowDownward } from "react-icons/md";
import { BookOpen, Code, Edit, CheckSquare, ExternalLink } from "lucide-react";
// Import language utilities
import { useTranslations } from "next-intl";

// Import components
import ExampleTab from "./components/ExampleTab";
import EnvironmentsList from "./components/EnvironmentsList";
import CommandsList from "./components/CommandsList";
import BestPractices from "./components/BestPractices";

export const MathJaxInstructions: React.FC = () => {
  // Get translations
  const t = useTranslations("MathJax");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedQuickRef, setCopiedQuickRef] = useState<string | null>(null);

  // References to sections for navigation
  const commandsRef = useRef<HTMLDivElement>(null);
  const environmentsRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const bestPracticesRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyQuickRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuickRef(text);
    setTimeout(() => setCopiedQuickRef(null), 2000);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Quick reference items
  const quickReferenceItems = [
    {
      type: "math",
      syntax: t("examples.quickRef.inlineMath.syntax"),
      description: "inlineMath",
    },
    {
      type: "math",
      syntax: t("examples.quickRef.displayMath.syntax"),
      description: "displayMath",
    },
    {
      type: "text",
      syntax: t("examples.quickRef.boldText.syntax"),
      description: "boldText",
    },
    {
      type: "text",
      syntax: t("examples.quickRef.italicText.syntax"),
      description: "italicText",
    },
    {
      type: "list",
      syntax: t("examples.quickRef.bulletList.syntax"),
      description: "bulletList",
    },
    {
      type: "list",
      syntax: t("examples.quickRef.numberedList.syntax"),
      description: "numberedList",
    },
    {
      type: "table",
      syntax: t("examples.quickRef.simpleTable.syntax"),
      description: "simpleTable",
    },
    {
      type: "layout",
      syntax: t("examples.quickRef.centerContent.syntax"),
      description: "centerContent",
    },
  ];

  // Get examples data from translations
  const examples = [
    {
      title: t("examples.categories.math.title"),
      description: t("examples.categories.math.description"),
      code: t("examples.categories.math.code"),
      annotations: [
        { startLine: 0, text: t("examples.categories.math.annotations.inline"), highlight: t("examples.categories.math.highlights.inline") },
        { startLine: 2, endLine: 3, text: t("examples.categories.math.annotations.display"), highlight: t("examples.categories.math.highlights.display") },
        { startLine: 5, text: t("examples.categories.math.annotations.altInline"), highlight: t("examples.categories.math.highlights.altSyntax") },
        { startLine: 7, endLine: 7, text: t("examples.categories.math.annotations.altDisplay"), highlight: t("examples.categories.math.highlights.altSyntax") }
      ],
      keyPoints: [
        { element: "$...$", text: t("examples.categories.math.keyPoints.inline.title"), description: t("examples.categories.math.keyPoints.inline.description") },
        { element: "$$...$$", text: t("examples.categories.math.keyPoints.display.title"), description: t("examples.categories.math.keyPoints.display.description") },
        { element: "\\(...\\)", text: t("examples.categories.math.keyPoints.altInline.title"), description: t("examples.categories.math.keyPoints.altInline.description") },
        { element: "\\[...\\]", text: t("examples.categories.math.keyPoints.altDisplay.title"), description: t("examples.categories.math.keyPoints.altDisplay.description") }
      ],
      variations: [
        {
          name: t("examples.categories.math.variations.matrix.name"),
          code: t("examples.categories.math.variations.matrix.code"),
          description: t("examples.categories.math.variations.matrix.description")
        },
        {
          name: t("examples.categories.math.variations.advanced.name"),
          code: t("examples.categories.math.variations.advanced.code"),
          description: t("examples.categories.math.variations.advanced.description")
        }
      ]
    },
    {
      title: t("examples.categories.text.title"),
      description: t("examples.categories.text.description"),
      code: t("examples.categories.text.code"),
      annotations: [
        { startLine: 2, text: t("examples.categories.text.annotations.bold"), highlight: t("examples.categories.text.highlights.bold") },
        { startLine: 3, text: t("examples.categories.text.annotations.italic"), highlight: t("examples.categories.text.highlights.italic") },
        { startLine: 4, text: t("examples.categories.text.annotations.underline"), highlight: t("examples.categories.text.highlights.underline") },
        { startLine: 5, text: t("examples.categories.text.annotations.monospace"), highlight: t("examples.categories.text.highlights.monospace") },
        { startLine: 7, text: t("examples.categories.text.annotations.color"), highlight: t("examples.categories.text.highlights.color") },
        { startLine: 9, text: t("examples.categories.text.annotations.size"), highlight: t("examples.categories.text.highlights.size") },
        { startLine: 11, text: t("examples.categories.text.annotations.combined"), highlight: t("examples.categories.text.highlights.combined") }
      ],
      keyPoints: [
        { element: "\\textbf{...}", text: t("examples.categories.text.keyPoints.bold.title"), description: t("examples.categories.text.keyPoints.bold.description") },
        { element: "\\textit{...}", text: t("examples.categories.text.keyPoints.italic.title"), description: t("examples.categories.text.keyPoints.italic.description") },
        { element: "\\textcolor{color}{...}", text: t("examples.categories.text.keyPoints.color.title"), description: t("examples.categories.text.keyPoints.color.description") },
        { element: "\\large{...}", text: t("examples.categories.text.keyPoints.size.title"), description: t("examples.categories.text.keyPoints.size.description") }
      ],
      variations: [
        {
          name: t("examples.categories.text.variations.sizes.name"),
          code: t("examples.categories.text.variations.sizes.code"),
          description: t("examples.categories.text.variations.sizes.description")
        }
      ]
    }
    // Continue with tables and advanced layout similarly
  ];

  const annotatedExamples = examples.map((example) =>
    createAnnotatedExample(example)
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <Badge className="mb-2" variant="outline">
          {t("documentation")}
        </Badge>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Quick access toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 border-b mb-8 -mx-4 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(environmentsRef)}
              className="flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("navigation.environments")}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(commandsRef)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("navigation.commands")}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(examplesRef)}
              className="flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("navigation.examples")}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(bestPracticesRef)}
              className="flex items-center gap-1"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("navigation.bestPractices")}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-semibold">{t("gettingStarted")}</h2>
          <a
            href={t("resources.links.officialDocs")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{t("officialDocs")}</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>

        <p className="mb-6 text-lg">{t("introduction")}</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-5 bg-muted/30 overflow-hidden border-primary/20">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <Badge variant="outline" className="mr-2 px-1.5 py-0">
                01
              </Badge>
              {t("sections.basicInlineMath")}
            </h3>
            <div className="mb-3">
              <p className="text-muted-foreground mb-2">
                {t("sections.writeThis")}
              </p>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                {t("examples.inlineMath.code")}
              </pre>
            </div>{" "}
            <div>
              <p className="text-muted-foreground mb-2">
                {t("sections.getThis")}
              </p>
              <div className="border p-3 rounded bg-card">
                <RenderMathJaxText content={t("examples.inlineMath.code")} />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-muted/30 overflow-hidden border-primary/20">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <Badge variant="outline" className="mr-2 px-1.5 py-0">
                02
              </Badge>
              {t("sections.basicDisplayMath")}
            </h3>
            <div className="mb-3">
              <p className="text-muted-foreground mb-2">
                {t("sections.writeThis")}
              </p>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                {t("examples.displayMath.code")}
              </pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">
                {t("sections.getThis")}
              </p>
              <div className="border p-3 rounded bg-card">
                <RenderMathJaxText content={t("examples.displayMath.code")} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5 bg-muted/30 overflow-hidden border-primary/20">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <Badge variant="outline" className="mr-2 px-1.5 py-0">
                03
              </Badge>
              {t("sections.basicTextFormatting")}
            </h3>
            <div className="mb-3">
              <p className="text-muted-foreground mb-2">
                {t("sections.writeThis")}
              </p>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                {t("examples.formatting.code")}
              </pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">
                {t("sections.getThis")}
              </p>
              <div className="border p-3 rounded bg-card">
                <RenderMathJaxText content={t("examples.formatting.code")} />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-muted/30 overflow-hidden border-primary/20">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <Badge variant="outline" className="mr-2 px-1.5 py-0">
                04
              </Badge>
              {t("sections.basicList")}
            </h3>
            <div className="mb-3">
              <p className="text-muted-foreground mb-2">
                {t("sections.writeThis")}
              </p>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                {t("examples.list.code")}
              </pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">
                {t("sections.getThis")}
              </p>
              <div className="border p-3 rounded bg-card">
                <RenderMathJaxText content={t("examples.list.code")} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick reference section */}
      <div className="mb-12">
        <h3 className="text-xl font-medium mb-4">
          {t("quickReference.title")}
        </h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[600px]">
            {quickReferenceItems.map((item, index) => (
              <Card
                key={index}
                className="border p-3 hover:border-primary transition-colors cursor-pointer"
                onClick={() => copyQuickRef(item.syntax)}
              >
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="font-normal text-xs">
                    {t(`quickReference.types.${item.type}`)}
                  </Badge>
                  {copiedQuickRef === item.syntax ? (
                    <MdDone className="h-4 w-4 text-success" />
                  ) : (
                    <MdContentCopy className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <pre className="text-xs font-mono overflow-x-auto mb-1">
                  {item.syntax}
                </pre>
                <p className="text-xs text-muted-foreground">
                  {t(`quickReference.descriptions.${item.description}`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div ref={environmentsRef} className="scroll-mt-16">
        <EnvironmentsList />
      </div>

      <div ref={commandsRef} className="scroll-mt-16">
        <CommandsList />
      </div>

      <div ref={examplesRef} className="mb-10 scroll-mt-16">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          {t("interactiveExamples")}
        </h2>

        <p className="mb-6 text-muted-foreground">{t("exploreExamples")}</p>

        <Tabs
          defaultValue={examples[0].title.toLowerCase().replace(/\s/g, "-")}
        >
          <div className="bg-muted/40 border-b px-1 pt-1">
        <TabsList className="mb-0 overflow-x-auto flex w-full h-auto bg-transparent p-0 gap-1">
          {annotatedExamples.map((example, index) => {
            // Get appropriate icon for each category
            const getIcon = () => {
              const title = example.title.toLowerCase();
              if (title.includes("math")) return "📐";
              if (title.includes("text")) return "🔤";
              return "📑";
            };
            
            return (
              <TabsTrigger
                key={index}
                value={example.title.toLowerCase().replace(/\s/g, "-")}
                className="min-w-fit whitespace-nowrap px-4 py-2 rounded-t-md data-[state=active]:bg-background data-[state=active]:border-b-transparent data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:shadow-none transition-all"
              >
                <span className="mr-2 text-base">{getIcon()}</span>
                <span>{example.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

          {annotatedExamples.map((example, index) => (
            <TabsContent
              key={index}
              value={example.title.toLowerCase().replace(/\s/g, "-")}
            >
              <ExampleTab
                example={example}
                index={index}
                copiedIndex={copiedIndex}
                onCopy={copyToClipboard}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollToSection(bestPracticesRef)}
            className="flex items-center gap-1"
          >
            <span>{t("viewBestPractices")}</span>
            <MdArrowDownward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={bestPracticesRef} className="scroll-mt-16">
        <BestPractices />
      </div>

      {/* Footer with additional resources */}
      <div className="mt-16 pt-8 border-t">
        <h3 className="text-lg font-medium mb-4">
          {t("resources.additionalResources")}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href={t("resources.links.mathjax")}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border rounded-md hover:bg-muted/50 transition-colors flex items-start"
          >
            <div>
              <h4 className="font-medium">
                {t("resources.officialDocs.title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("resources.officialDocs.description")}
              </p>
            </div>
          </a>
          <a
            href={t("resources.links.latex")}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
          >
            <h4 className="font-medium">
              {t("resources.latexWikibooks.title")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("resources.latexWikibooks.description")}
            </p>
          </a>
          <a
            href={t("resources.links.detexify")}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
          >
            <h4 className="font-medium">{t("resources.detexify.title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("resources.detexify.description")}
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MathJaxInstructions;
