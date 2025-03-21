import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import CopyButton from "../copy-button";
import { completionItemProviderMathJaxLatex, languageConfigurationMathJaxLatex, monarchTokensProviderMathJaxLatex, THEMES } from "./options";

// Initialize Monaco themes
loader.init().then((monaco) => {
  Object.entries(THEMES).forEach(([name, theme]) => {
    monaco.editor.defineTheme(name, theme as any);
  });
  monaco.languages.register({ id: "mathjaxlatex" });
  monaco.languages.setLanguageConfiguration("mathjaxlatex", languageConfigurationMathJaxLatex);
  monaco.languages.setMonarchTokensProvider("mathjaxlatex", monarchTokensProviderMathJaxLatex);
  monaco.languages.registerCompletionItemProvider('mathjaxlatex', completionItemProviderMathJaxLatex(monaco));
});

interface fitEdtiorLatexProps {
  content: string;
  className?: string;
  onChange: (value: string) => void;
  minLine: number;
}

export function FitEditorLatex({
  content,
  className,
  minLine,
  onChange,
} : fitEdtiorLatexProps){
  const [theme, setTheme] = React.useState("");
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const updateTheme = () => {
      const isLightMode = document.documentElement.classList.contains("light");
      setTheme(isLightMode ? 'mathjax-light' : 'mathjax-dark');    
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (editorContainerRef.current) {
      setContainerWidth(editorContainerRef.current.offsetWidth);
    }
  }, [editorContainerRef.current]);

  const calculateHeight = (content: string) => {
    const lineNumberWidth = 68; // Width of line number gutter
    const lineHeight = 21; // Adjust based on your font size and line height
    const characterWidth = 9; // Adjust based on your font size
    const approxCharsPerLine = Math.floor((containerWidth - lineNumberWidth) / characterWidth); // Approximate number of characters per line
    const wrappedLines = content.split("\n").reduce((totalLines, line) => {
      return totalLines + Math.max(1, Math.ceil(line.length / approxCharsPerLine));
    }, 0);
  
    return lineHeight * Math.max(minLine, wrappedLines);
  };

  return (
    <div ref={editorContainerRef} className={`${className} flex-1 relative group rounded-md border`}>
      <CopyButton content={content} classname="absolute top-3 right-3 z-10 
            opacity-0 group-hover:opacity-100
            transition-all duration-200 ease-in-out
            bg-background/70 backdrop-blur-md
            hover:bg-background/90 hover:scale-105
            shadow-lg border border-border/50
            hover:border-border/80 hover:shadow-xl
            active:scale-95"/>

      <Editor
        height={calculateHeight(content)}
        width="100%"
        onChange={(value) => onChange(value || "")}
        language='mathjaxlatex'
        theme={theme}
        value={content}
        options={{
          wordWrap: "on",
          fontSize: 14,
          readOnly: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          bracketPairColorization: {
            enabled: true,
          },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoIndent: "full",
          dragAndDrop: true,
          links: true,
          mouseWheelZoom: true,
          folding: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          formatOnPaste: true,
          formatOnType: true,
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            alwaysConsumeMouseWheel: false,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
          renderLineHighlightOnlyWhenFocus: true,
          contextmenu: true,
          fontLigatures: true,
          renderWhitespace: "selection",
        }}
      />
    </div>
  );
}

interface fitEditorProps {
  content: string;
  className?: string;
  language: string;
  readOnly?: boolean;
}


export default function FitEditor({
  content,
  className,
  language,
  readOnly = false,
}: fitEditorProps): JSX.Element {
  const [theme, setTheme] = React.useState("custom-vs-dark");

  React.useEffect(() => {
    const updateTheme = () => {
      const isLightMode = document.documentElement.classList.contains("light");
      setTheme(isLightMode ? "vs-light" : "custom-vs-dark");
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [language]);

  return (
    <div className={`${className} flex-1 relative group rounded-sm border`}>
      <CopyButton content={content} classname="absolute top-3 right-3 z-10 
            opacity-0 group-hover:opacity-100
            transition-all duration-200 ease-in-out
            bg-background/70 backdrop-blur-md
            hover:bg-background/90 hover:scale-105
            shadow-lg border border-border/50
            hover:border-border/80 hover:shadow-xl
            active:scale-95"/>

      <Editor
        height={14*2 + 21 * content.split("\n").length}
        width="100%"
        language={language}
        value={content}
        theme={theme}
        options={{
          fontSize: 14,
          lineNumbers: "off",
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          bracketPairColorization: {
            enabled: true,
          },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoIndent: "full",
          dragAndDrop: true,
          links: true,
          mouseWheelZoom: true,
          folding: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          formatOnPaste: true,
          formatOnType: true,
          padding: { top: 14, bottom: 14 },
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            alwaysConsumeMouseWheel: false,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
          renderLineHighlightOnlyWhenFocus: true,
          contextmenu: true,
          fontLigatures: true,
          renderWhitespace: "selection",
        }}
      />
    </div>
  );
}