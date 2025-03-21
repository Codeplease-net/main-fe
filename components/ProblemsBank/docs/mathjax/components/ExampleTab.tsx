import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MdContentCopy, MdDone, MdInfoOutline, MdEdit, MdCheck, MdRefresh } from "react-icons/md";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Example {
  title: string;
  description: string;
  code: string;
  annotations?: Array<{
    startLine: number;
    endLine?: number;
    text: string;
    highlight?: string;
  }>;
  variations?: Array<{
    name: string;
    code: string;
    description: string;
  }>;
  keyPoints?: Array<{
    text: string;
    element: string;
    description: string;
  }>;
}

interface ExampleTabProps {
  example: Example;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const ExampleTab: React.FC<ExampleTabProps> = ({ 
  example, 
  index, 
  copiedIndex, 
  onCopy 
}) => {
  // Component state management
  const [editMode, setEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState(example.code);
  const [liveCode, setLiveCode] = useState(example.code);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [showCodeAnnotations, setShowCodeAnnotations] = useState(true);
  const [currentCodeForDisplay, setCurrentCodeForDisplay] = useState(example.code);
  
  // Add a contentKey state to force re-render of MathJax content
  const [contentKey, setContentKey] = useState(0);
  
  // Keep track of component mount state
  const isMounted = useRef(true);
  
  // Reset state when example changes
  useEffect(() => {
    if (isMounted.current) {
      setEditedCode(example.code);
      setLiveCode(example.code);
      setSelectedVariation(0);
      setCurrentCodeForDisplay(example.code);
      // Force a re-render of the MathJax content
      setContentKey(prev => prev + 1);
    }
  }, [example]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Update display code whenever relevant state changes
  useEffect(() => {
    if (isMounted.current) {
      const newCode = editMode ? editedCode : liveCode;
      if (newCode !== currentCodeForDisplay) {
        setCurrentCodeForDisplay(newCode);
        // Force a re-render of the MathJax content when code changes
        setContentKey(prev => prev + 1);
      }
    }
  }, [editMode, editedCode, liveCode]);
  
  // Split the code into lines for annotation
  const codeLines = currentCodeForDisplay.split('\n');
  
  // Handle code editing and preview
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCode(e.target.value);
  };

  const applyChanges = () => {
    setLiveCode(editedCode);
    setEditMode(false);
  };

  const resetChanges = () => {
    // Reset back to either the default code or the selected variation
    const codeToUse = selectedVariation === 0 
      ? example.code 
      : example.variations?.[selectedVariation - 1]?.code || example.code;
      
    setEditedCode(codeToUse);
    setLiveCode(codeToUse);
    setEditMode(false);
    
    // Force a re-render of the MathJax content
    setContentKey(prev => prev + 1);
  };

  // For variations if available
  const handleVariationChange = (idx: number) => {
    // Make sure idx is valid (positive and within available variations)
    if (idx < 0 || (idx !== 0 && (!example.variations || idx > example.variations.length))) {
      return;
    }
    
    setSelectedVariation(idx);
    
    // Set the code based on selected variation
    const newCode = idx === 0 
      ? example.code 
      : example.variations?.[idx - 1]?.code || example.code;
    
    // Use a safe batch update to prevent race conditions
    setEditedCode(newCode);
    setLiveCode(newCode);
    setCurrentCodeForDisplay(newCode);
    
    // Force a re-render of the MathJax content
    setContentKey(prev => prev + 1);
  };

  const handleCopyClick = () => {
    // Copy the current code that's being displayed
    onCopy(currentCodeForDisplay, index);
  };

  // Safely render MathJax content with keys to prevent DOM manipulation conflicts
  const renderMathJaxContent = () => {
    if (!currentCodeForDisplay) return null;
    
    return (
      <div key={`mathjax-content-${contentKey}`}>
        <RenderMathJaxText content={currentCodeForDisplay} />
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-border mb-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-border bg-muted">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h3 className="font-semibold">{example.title}</h3>
            <p className="text-sm text-muted-foreground">{example.description}</p>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <Button 
              onClick={handleCopyClick} 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-1"
              aria-label={copiedIndex === index ? "Copied to clipboard" : "Copy code"}
            >
              {copiedIndex === index ? (
                <>
                  <MdDone className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowCodeAnnotations(!showCodeAnnotations)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              aria-label={showCodeAnnotations ? "Hide notes" : "Show notes"}
            >
              <MdInfoOutline className="h-4 w-4" />
              <span>{showCodeAnnotations ? "Hide" : "Show"} Notes</span>
            </Button>
          </div>
        </div>

        {/* Variations as simple buttons */}
        {example.variations && example.variations.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedVariation === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => handleVariationChange(0)}
              >
                Default
              </Button>
              {example.variations.map((variation, idx) => (
                <Button
                  key={`variation-${idx}`}
                  variant={selectedVariation === idx + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVariationChange(idx + 1)}
                >
                  {variation.name}
                </Button>
              ))}
            </div>
            {selectedVariation > 0 && example.variations[selectedVariation - 1] && (
              <p className="text-sm text-muted-foreground mt-2">
                {example.variations[selectedVariation - 1].description}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Source code section */}
        <div className="p-4 relative">          
          {editMode ? (
            <Textarea
              value={editedCode}
              onChange={handleCodeChange}
              className="font-mono text-sm min-h-[200px]"
              placeholder="Edit the MathJax code to see live changes"
              aria-label="Edit MathJax code"
            />
          ) : (
            <div className="relative">
              <pre className="text-sm bg-muted/50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                {codeLines.map((line, lineIndex) => {
                  
                  return (
                    <div key={`line-${lineIndex}`} className="relative group">
                      {line}
                    </div>
                  );
                })}
              </pre>
              
              {/* Key syntax elements */}
              {showCodeAnnotations && example.keyPoints && example.keyPoints.length > 0 && (
                <div className="mt-4 border-t pt-3 border-dashed">
                  <h5 className="text-sm font-medium mb-2">Key Elements:</h5>
                  <div className="space-y-2">
                    {example.keyPoints.map((point, i) => (
                      <div key={`keypoint-${i}`} className="flex items-start">
                        <Badge className="mr-2 mt-0.5 shrink-0" variant="outline">
                          {point.element}
                        </Badge>
                        <div>
                          <p className="text-sm">{point.text}</p>
                          <p className="text-xs text-muted-foreground">{point.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Rendered result section */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Rendered Result:</h4>
            {editMode && (
              <Badge variant="outline" className="text-xs">
                Live Preview
              </Badge>
            )}
          </div>
          
          <div className="border border-border p-4 rounded bg-card overflow-x-auto min-h-[200px]">
            {renderMathJaxContent()}
          </div>
          
          {/* Usage examples */}
          {!editMode && example.title === "Mathematical Expressions" && (
            <div className="mt-6 border-t pt-4">
              <h5 className="text-sm font-medium mb-2">Common Math Symbols:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="text-xs border rounded p-2">
                  <code>$\alpha, \beta, \gamma$</code>
                  <div className="mt-1 border-t pt-1">
                    <RenderMathJaxText key="example-1" content="$\alpha, \beta, \gamma$" />
                  </div>
                </div>
                <div className="text-xs border rounded p-2">
                  <code>{'$\sum_{i=1}^{n} i^2$'}</code>
                  <div className="mt-1 border-t pt-1">
                    <RenderMathJaxText key="example-2" content="$\sum_{i=1}^{n} i^2$" />
                  </div>
                </div>
                <div className="text-xs border rounded p-2">
                  <code>{'$\frac{a}{b}$'}</code>
                  <div className="mt-1 border-t pt-1">
                    <RenderMathJaxText key="example-3" content="$\frac{a}{b}$" />
                  </div>
                </div>
                <div className="text-xs border rounded p-2">
                  <code>{'$\sqrt{x^2 + y^2}$'}</code>
                  <div className="mt-1 border-t pt-1">
                    <RenderMathJaxText key="example-4" content="$\sqrt{x^2 + y^2}$" />
                  </div>
                </div>
                <div className="text-xs border rounded p-2">
                  <code>{'$\int_{0}^{\infty} f(x) dx$'}</code>
                  <div className="mt-1 border-t pt-1">
                    <RenderMathJaxText key="example-5" content="$\int_{0}^{\infty} f(x) dx$" />
                  </div>
                </div>
                <div className="text-xs border rounded p-2">
                  <code>{'$\forall x \in \mathbb{R}$'}</code>
                  <div className="mt-1 border-t pt-1">
                    <RenderMathJaxText key="example-6" content="$\forall x \in \mathbb{R}$" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Example-specific tips */}
          {!editMode && example.title === "Lists" && (
            <div className="mt-6 border-t pt-4">
              <h5 className="text-sm font-medium mb-2">List-Specific Tips:</h5>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Use <code>\item</code> for each list element</li>
                <li>Nest lists by adding indentation in your code</li>
                <li>Empty lines between items are ignored</li>
                <li>Use <code>itemize</code> for bullet points, <code>enumerate</code> for numbered lists</li>
              </ul>
            </div>
          )}

          {!editMode && example.title === "Tables" && (
            <div className="mt-6 border-t pt-4">
              <h5 className="text-sm font-medium mb-2">Table Column Specifiers:</h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="border rounded p-2">
                  <code>l</code> - Left aligned
                </div>
                <div className="border rounded p-2">
                  <code>c</code> - Center aligned
                </div>
                <div className="border rounded p-2">
                  <code>r</code> - Right aligned
                </div>
                <div className="border rounded p-2">
                  <code>|</code> - Vertical line
                </div>
                <div className="border rounded p-2">
                  <code>\hline</code> - Horizontal line
                </div>
                <div className="border rounded p-2">
                  <code>&</code> - Column separator
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced with annotations for common examples
export const createAnnotatedExample = (example: Example): Example => {
  // Add annotations based on example type
  if (example.title === "Mathematical Expressions" && !example.annotations) {
    return {
      ...example,
      annotations: [
        { startLine: 0, text: "Use single dollar signs for inline math", highlight: "Inline Math" },
        { startLine: 2, endLine: 2, text: "Double dollar signs create centered display math", highlight: "Display Math" },
        { startLine: 4, text: "Alternative delimiters for inline math", highlight: "Inline Alternative" },
      ],
      keyPoints: [
        { element: "$...$", text: "Inline Math", description: "Embed formulas within text" },
        { element: "$$...$$", text: "Display Math", description: "Stand-alone equations on their own line" },
        { element: "\\(...\\)", text: "Alternative Inline", description: "Another way to write inline math" },
      ]
    };
  }
  
  if (example.title === "Tables" && !example.annotations) {
    return {
      ...example,
      annotations: [
        { startLine: 0, text: "Table column format: l=left, c=center, r=right, |=vertical line", highlight: "Column Format" },
        { startLine: 1, text: "\\hline creates horizontal lines", highlight: "Horizontal Line" },
        { startLine: 2, text: "& separates columns, \\\\ ends the row", highlight: "Row Structure" },
      ],
      keyPoints: [
        { element: "{|l|c|r|}", text: "Column Format", description: "Defines alignment and borders" },
        { element: "\\hline", text: "Horizontal Line", description: "Creates horizontal borders" },
        { element: "&", text: "Column Separator", description: "Separates cells in a row" },
        { element: "\\\\", text: "Row End", description: "Indicates the end of a table row" },
      ]
    };
  }
  
  if (example.title === "Lists" && !example.annotations) {
    return {
      ...example,
      annotations: [
        { startLine: 0, text: "Begin the list environment with \\begin{itemize} for bullet points", highlight: "Begin List" },
        { startLine: 1, text: "Each item starts with \\item", highlight: "List Item" },
        { startLine: 4, text: "End the list environment with \\end{itemize}", highlight: "End List" },
      ],
      keyPoints: [
        { element: "\\begin{itemize}", text: "Bullet List", description: "Creates an unordered list with bullet points" },
        { element: "\\begin{enumerate}", text: "Numbered List", description: "Creates an ordered list with numbers" },
        { element: "\\item", text: "List Item", description: "Defines each item in the list" },
      ]
    };
  }
  
  return example;
};

export default ExampleTab;