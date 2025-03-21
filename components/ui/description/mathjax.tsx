"use client";

import { MathJaxContext } from "better-react-mathjax";
import { Example } from "./example";
import { MathJax } from "better-react-mathjax";
import React, { useState, useEffect, useMemo } from "react";
import AutoFitEditor from "./fit-editor";
import { Skeleton } from "../skeleton";
import { useTranslations } from "next-intl"; // Import the translations hook

const config = {
  loader: { 
    load: ["[tex]/html", "[tex]/colorv2", "input/asciimath", "[tex]/ams", "[tex]/mhchem", "[tex]/noerrors", "[tex]/noundefined"],
    paths: {
      mathjax: "https://cdn.jsdelivr.net/npm/mathjax@3/es5"  // Use CDN for faster loading (or remove to use default)
    },
  },
  tex: {
    packages: {
      "[+]": ["html", "colorv2", "ams", "mhchem", "noerrors", "noundefined"],
    },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
    macros: {
      // Add custom macros here for frequently used expressions
      // Example: "R": "\\mathbb{R}"
    },
    processEscapes: true,     // Allows using \$ to represent $ in text
    processEnvironments: true, // Process \begin{} \end{} environments
  },
  svg: {
    fontCache: "global",
    scale: 1,               // Adjust scale if needed
    matchFontHeight: true,  // Match surrounding font height
  },
  options: {
    enableMenu: false,       // Disable context menu for cleaner UI
    typesetting: { 
      concurrentTypesetting: true  // Enable parallel typesetting for better performance
    },
    renderActions: {
      addMenu: [],          // Remove menu for cleaner UI
    },
  },
  startup: {
    pageReady: () => {
      console.log('MathJax is ready');
      return Promise.resolve();
    }
  }
};

// Mapping LaTeX commands to styles
const styleMap: { [key: string]: React.CSSProperties | string } = {
  bf: { fontWeight: "bold" },
  textbf: { fontWeight: "bold" },
  it: { fontStyle: "italic" },
  textit: { fontStyle: "italic" },
  t: { fontFamily: 'Courier New, monospace' },
  tt: { fontFamily: 'Courier New, monospace' },
  texttt: { fontFamily: 'Courier New, monospace' },
  emph: { textDecoration: "underline" },
  underline: { textDecoration: "underline" },
  sout: { textDecoration: "line-through" },
  textsc: { textTransform: "uppercase", fontVariant: "small-caps" },
  tiny: { fontSize: "0.7em" },
  scriptsize: { fontSize: "0.75em" },
  small: { fontSize: "0.85em" },
  normalsize: { fontSize: "1em" },
  large: { fontSize: "1.15em" },
  Large: { fontSize: "1.3em" },
  LARGE: { fontSize: "1.45em" },
  huge: { fontSize: "1.75em" },
  HUGE: { fontSize: "2em" },
  h1: { fontSize: "2em", fontWeight: "bold" },
  h2: { fontSize: "1.7em", fontWeight: "bold" },
  h3: { fontSize: "1.45em", fontWeight: "bold" },
  h4: { fontSize: "1.3em", fontWeight: "bold" },
  h5: { fontSize: "1.15em", fontWeight: "bold" },
  h6: { fontSize: "1em", fontWeight: "bold" },
  section: {
    fontSize: "1.8em",
    fontWeight: "bold",
    marginTop: "1.2em",
    marginBottom: "0.6em",
  },
  subsection: {
    fontSize: "1.5em",
    fontWeight: "bold",
    marginTop: "1em",
    marginBottom: "0.5em",
  },
  subsubsection: {
    fontSize: "1.2em",
    fontWeight: "bold",
    marginTop: "0.8em",
    marginBottom: "0.4em",
  },
  fbox: { border: "1px solid currentColor", padding: "0.2em" },
  boxed: { border: "1px solid currentColor", padding: "0.2em" },
  tableBorder: {
    border: "1px solid currentColor",
    padding: "0.5rem",
  },
  tableCell: {
    padding: "0.5rem",
    textAlign: "center",
  },
  verticalLine: {
    borderLeft: "1px solid currentColor",
    borderRight: "1px solid currentColor",
  },
  horizontalLine: {
    borderTop: "1px solid currentColor",
    borderBottom: "1px solid currentColor",
  },
  textcolor: { color: "inherit" }, // Base definition, actual color set dynamically
};

interface TableCellProps {
  content: React.ReactNode;
  rowSpan?: number;
  colSpan?: number;
  align?: "left" | "center" | "right";
  hasBorder?: boolean;
  style?: React.CSSProperties;
}

export const formatDashes = (text: string): string => {
  // Replace '---' with a very long dash (em dash)
  text = text.replace(/---/g, "—");
  // Replace '--' with a long dash (en dash)
  text = text.replace(/--/g, "–");
  return text;
};

export const parseInlineCommands = (
  text: string,
  sub: boolean = false
): React.ReactNode => {
  let formattedText = formatDashes(text);
  // Handle common LaTeX shortcuts
  formattedText = formattedText.replace(/\\bullet\s*/g, "• ");
  formattedText = formattedText.replace(/\\ldots/g, "...");
  formattedText = formattedText.replace(/\\textregistered/g, "®");
  formattedText = formattedText.replace(/\\copyright/g, "©");
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Process the text one character at a time to handle nested braces properly
  let i = 0;
  while (i < formattedText.length) {
    // Check for escaped special characters
    if (formattedText[i] === '\\' && i + 1 < formattedText.length) {
      const nextChar = formattedText[i+1];
      // Check if this is an escaped special character
      if (['$', '#', '%', '&', '_', '{', '}', '~', '^', '\\'].includes(nextChar)) {
        // Handle text before this escape sequence
        if (i > lastIndex) {
          parts.push(
            <span key={`${lastIndex}-pre-escape`}>
              {formattedText.slice(lastIndex, i)}
            </span>
          );
        }
        
        // Add the literal special character
        parts.push(<span key={`${i}-escaped`}>{nextChar}</span>);
        
        // Update indices to skip past this escape sequence
        lastIndex = i + 2;
        i += 2;
        continue;
      }
    }
    
    // Check for math expressions
    if (formattedText[i] === '$' && (i === 0 || formattedText[i-1] !== '\\')) {
      // Handle math delimiters
      const isDisplayMath = formattedText[i+1] === '$';
      const delimiter = isDisplayMath ? "$$" : "$";
      const startIndex = i;
      
      // Find the closing delimiter, skipping escaped $
      i += delimiter.length;
      let found = false;
      while (i < formattedText.length) {
        if (formattedText[i] === '$' && formattedText[i-1] !== '\\') {
          if (isDisplayMath && formattedText[i+1] === '$') {
            found = true;
            i += 2;
            break;
          } else if (!isDisplayMath) {
            found = true;
            i += 1;
            break;
          }
        }
        i++;
      }
      
      if (found) {
        // Add text before the math expression
        if (startIndex > lastIndex) {
          parts.push(
            <span key={`${lastIndex}-pre`}>
              {formattedText.slice(lastIndex, startIndex)}
            </span>
          );
        }
        
        // Add the math expression
        parts.push(
          <span key={`${lastIndex}-math`}>
            {formattedText.slice(startIndex, i)}
          </span>
        );
        
        lastIndex = i;
        continue;
      }
      
      // Reset if we didn't find closing delimiter
      i = startIndex + 1;
    }
    
    // Check for LaTeX commands
    if (formattedText[i] === '\\' && i + 1 < formattedText.length && /[a-zA-Z]/.test(formattedText[i+1])) {
      // Extract command name
      let cmdStart = i;
      i++; // Skip backslash
      let cmdName = "";
      
      // Extract command name (letters only)
      while (i < formattedText.length && /[a-zA-Z]/.test(formattedText[i])) {
        cmdName += formattedText[i];
        i++;
      }
      
      // Special handling for specific commands
      if (cmdName === "href" || cmdName === "textcolor" || cmdName === "url" ||
          styleMap[cmdName] !== undefined) {
        
        // Process command arguments within braces
        let args: string[] = [];
        while (i < formattedText.length && formattedText[i] === '{') {
          i++; // Skip opening brace
          let braceLevel = 1;
          let argContent = "";
          
          while (i < formattedText.length && braceLevel > 0) {
            if (formattedText[i] === '{' && formattedText[i-1] !== '\\') {
              braceLevel++;
            } else if (formattedText[i] === '}' && formattedText[i-1] !== '\\') {
              braceLevel--;
            }
            
            if (braceLevel > 0) {
              argContent += formattedText[i];
            }
            i++;
          }
          
          args.push(argContent);
        }
        
        // Add text before command
        if (cmdStart > lastIndex) {
          parts.push(
            <span key={`${lastIndex}-pre`}>
              {formattedText.slice(lastIndex, cmdStart)}
            </span>
          );
        }
        
        if (cmdName === "href" && args.length >= 2) {
          // Handle href
          parts.push(
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              key={`${lastIndex}-href`}
              href={args[0]}
            >
              {parseInlineCommands(args[1], true)}
            </a>
          );
        } else if (cmdName === "textcolor" && args.length >= 2) {
          // Handle textcolor
          parts.push(
            <span
              key={`${lastIndex}-color`}
              style={{ color: args[0] }}
            >
              {parseInlineCommands(args[1], true)}
            </span>
          );
        } else if (cmdName === "url" && args.length >= 1) {
          // Handle url
          parts.push(
            <a
              key={`${lastIndex}-url`}
              href={args[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {args[0]}
            </a>
          );
        } else if (styleMap[cmdName] && args.length >= 1) {
          // Handle styling commands
          const style = styleMap[cmdName] || {};
          parts.push(
            React.createElement(
              "span",
              {
                key: `${lastIndex}-${cmdName}`,
                style: style as React.CSSProperties,
              },
              parseInlineCommands(args[0], true)
            )
          );
        } else {
          // Command not properly handled, just keep original text
          parts.push(
            <span key={`${lastIndex}-unknown`}>
              {formattedText.slice(cmdStart, i)}
            </span>
          );
        }
        
        lastIndex = i;
        continue;
      }
    }
    
    // Check for Markdown headings (only at line start, and not with a preceding backslash)
    if (formattedText[i] === '#' && 
        (i === 0 || formattedText[i-1] === '\n') && 
        (i === 0 || formattedText[i-1] !== '\\')) {
      
      let hashCount = 0;
      const startIndex = i;
      
      // Count # symbols
      while (i < formattedText.length && formattedText[i] === '#') {
        hashCount++;
        i++;
      }
      
      // If followed by space, it's a heading
      if (i < formattedText.length && formattedText[i] === ' ' && hashCount <= 6) {
        i++; // Skip the space
        
        // Find the end of line
        const lineStart = i;
        while (i < formattedText.length && formattedText[i] !== '\n') {
          i++;
        }
        
        // Add text before heading
        if (startIndex > lastIndex) {
          parts.push(
            <span key={`${lastIndex}-pre`}>
              {formattedText.slice(lastIndex, startIndex)}
            </span>
          );
        }
        
        // Add heading
        const headingText = formattedText.slice(lineStart, i);
        const headingTag = `h${hashCount}` as keyof typeof styleMap;
        parts.push(
          <div
            key={`${lastIndex}-heading`}
            style={styleMap[headingTag] as React.CSSProperties}
          >
            {headingText}
          </div>
        );
        
        lastIndex = i;
        continue;
      }
    }
    
    // Move to next character if no special handling
    i++;
  }

  // Push remaining text
  if (lastIndex < formattedText.length) {
    parts.push(
      <span key={`${lastIndex}-final`}>
        {formattedText.slice(lastIndex)}
      </span>
    );
  }

  return sub ? parts : <MathJax>{parts}</MathJax>;
};

interface DetailProps {
  summary: string;
  children: React.ReactNode;
  className?: string;
  t: (key: string) => string; // Accept translation function
}

const Detail: React.FC<DetailProps> = ({ summary, children, className, t }) => {
  return (
    <details
      className={`
    group
    border border-border
    rounded-lg 
    p-4 my-3
    transition-all
    hover:shadow-sm
    bg-muted/50
    ${className || ""}
  `}
    >
      <summary
        className="
          cursor-pointer 
          font-medium 
          flex items-center 
          justify-between
          select-none
        "
      >
        {summary || t('details.defaultSummary')}
        <svg
          className="w-4 h-4 transform transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  content,
  rowSpan,
  colSpan,
  align = "center",
  hasBorder = false,
  style = {}, // Add default empty object
}) => (
  <td
    rowSpan={rowSpan}
    colSpan={colSpan}
    style={{
      ...(styleMap.tableCell as React.CSSProperties),
      textAlign: align,
      ...(hasBorder ? (styleMap.tableBorder as React.CSSProperties) : {}),
      ...style, // Apply the passed style
    }}
  >
    {content}
  </td>
);

// Modify parseLaTeXToReact to accept a translation function
export const parseLaTeXToReact = (text: string, t: (key: string) => string): React.ReactNode => {
  const parseNestedContent = (content: string): React.ReactNode[] => {
    // Update the blockRegex to include epigraph
    const blockRegex =
      /\\begin{(itemize|enumerate|center|detail|example|cpp|java|python|tabular|theorem|lemma|definition|corollary|proof)}([\s\S]*?)\\end{\1}|\\epigraph\{([\s\S]*?)\}\{([\s\S]*?)\}/g;
    const results: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(content)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        const beforeText = content.slice(lastIndex, match.index).trim();
        if (beforeText) {
          results.push(
            <div key={`text-${lastIndex}`}>
              {parseInlineCommands(beforeText)}
            </div>
          );
        }
      }

      // Check if this is an epigraph (match[3] and match[4] will have content if this is an epigraph)
      if (match[3] !== undefined && match[4] !== undefined) {
        // This is an epigraph command
        const quoteText = match[3].trim();
        const attribution = match[4].trim();
        
        results.push(
          <blockquote 
            key={`epigraph-${lastIndex}`} 
            className="pl-4 italic text-muted-foreground border-l-4 border-muted my-6 max-w-2xl mx-auto"
          >
            <p className="mb-2">{parseInlineCommands(quoteText, true)}</p>
            {attribution && (
              <footer className="text-right font-medium text-sm not-italic">
                — {parseInlineCommands(attribution, true)}
              </footer>
            )}
          </blockquote>
        );
      } else {
        // This is a regular environment
        const [fullMatch, tag, innerContent] = match;

        switch (tag) {
          case "tabular":
            try {
              // Extract the column specification
              const alignmentRegex = /^\{([^}]+)\}/;
              const alignMatch = innerContent.match(alignmentRegex);
              const alignSpec = alignMatch ? alignMatch[1] : "";

              // Remove column spec from inner content
              const tableRowsContent = alignMatch
                ? innerContent.substring(alignMatch[0].length).trim()
                : innerContent;

              // Parse column specifications
              interface ColumnSpec {
                align: "left" | "center" | "right";
                hasLeftBorder: boolean;
                hasRightBorder: boolean;
              }

              const columnSpecs: ColumnSpec[] = [];
              let hasVerticalLine = false;

              for (let i = 0; i < alignSpec.length; i++) {
                const char = alignSpec[i];
                if (char === "|") {
                  hasVerticalLine = true;
                } else if (["l", "c", "r"].includes(char)) {
                  columnSpecs.push({
                    align:
                      char === "c" ? "center" : char === "l" ? "left" : "right",
                    hasLeftBorder: hasVerticalLine,
                    hasRightBorder: false,
                  });
                  hasVerticalLine = false;
                }
              }

              // Add trailing right border if needed
              if (hasVerticalLine && columnSpecs.length > 0) {
                columnSpecs[columnSpecs.length - 1].hasRightBorder = true;
              }

              // Split the content into individual rows
              const rawRows = tableRowsContent
                .split(/\\\\/)
                .map((row) => (row ? row.trim() : ""))
                .filter((row) => row.length > 0);

              // Track horizontal lines
              interface LineState {
                top: boolean;
                bottom: boolean;
                clineColumns: number[];
              }

              // Create a 2D grid to track cell visibility and properties
              interface CellState {
                content: React.ReactNode;
                rowSpan: number;
                colSpan: number;
                align: "left" | "center" | "right";
                hasLeftBorder: boolean;
                hasRightBorder: boolean;
                isVisible: boolean; // Whether this cell should render or is covered by another spanning cell
                originalRow: number; // Track which row this cell originally belongs to (for multirow)
                originalCol: number; // Track which column this cell originally belongs to (for multicolumn)
              }

              const horizontalLines: { [rowIndex: number]: LineState } = {};

              // Special handling for table that starts with multiple hlines
              let initialHlines = 0;
              for (
                let i = 0;
                rawRows.length > 0 && rawRows[0].startsWith("\\hline");
                i++
              ) {
                rawRows[0] = rawRows[0].replace(/^\\hline\s*/, "");
                initialHlines++;

                // If that was the only content, remove the empty row
                if (rawRows[0].trim() === "") {
                  rawRows.shift();
                  i--; // Adjust counter since we removed an element
                }
              }

              // Add top border based on initial hlines
              if (initialHlines > 0) {
                horizontalLines[0] = {
                  top: true,
                  bottom: false,
                  clineColumns: [],
                };
              }

              // Process rows to extract \hline and \cline commands
              const processedRows = [];
              for (let i = 0; i < rawRows.length; i++) {
                let row = rawRows[i];

                // Check if row starts with \hline
                if (row.startsWith("\\hline")) {
                  row = row.replace(/^\\hline\s*/, ""); // Remove the \hline

                  // Mark the current row with top border
                  if (!horizontalLines[processedRows.length]) {
                    horizontalLines[processedRows.length] = {
                      top: true,
                      bottom: false,
                      clineColumns: [],
                    };
                  } else {
                    horizontalLines[processedRows.length].top = true;
                  }

                  // If this is the last row and it's just \hline, mark bottom border of previous row
                  if (
                    row.trim() === "" &&
                    i === rawRows.length - 1 &&
                    processedRows.length > 0
                  ) {
                    if (!horizontalLines[processedRows.length - 1]) {
                      horizontalLines[processedRows.length - 1] = {
                        top: false,
                        bottom: true,
                        clineColumns: [],
                      };
                    } else {
                      horizontalLines[processedRows.length - 1].bottom = true;
                    }
                    continue; // Skip empty rows
                  }
                }

                // Handle \cline if present
                if (row.includes("\\cline")) {
                  const clineRegex = /\\cline\{(\d+)-(\d+)\}/g;
                  let clineMatch;
                  const rowIndex = processedRows.length - 1;

                  if (rowIndex >= 0) {
                    if (!horizontalLines[rowIndex]) {
                      horizontalLines[rowIndex] = {
                        top: false,
                        bottom: false,
                        clineColumns: [],
                      };
                    }

                    while ((clineMatch = clineRegex.exec(row)) !== null) {
                      const startCol = parseInt(clineMatch[1]) - 1;
                      const endCol = parseInt(clineMatch[2]) - 1;

                      for (let col = startCol; col <= endCol; col++) {
                        if (
                          !horizontalLines[rowIndex].clineColumns.includes(col)
                        ) {
                          horizontalLines[rowIndex].clineColumns.push(col);
                        }
                      }
                    }

                    // Remove \cline commands from the row
                    row = row.replace(/\\cline\{\d+-\d+\}/g, "").trim();
                  }

                  // Skip if row is empty after removing \cline
                  if (row === "") continue;
                }

                // Add non-empty row to processed rows
                if (row !== "") {
                  processedRows.push(row);
                }
              }

              // Create a 2D grid to represent our table
              const grid: CellState[][] = [];
              let activeMultirows: {
                rowSpan: number;
                startRow: number;
                col: number;
              }[] = [];
              let activeMultirowCells: {
                rowSpan: number;
                startRow: number;
                col: number;
                content: React.ReactNode;
              }[] = [];

              // Process cell content and build the grid
              for (
                let rowIndex = 0;
                rowIndex < processedRows.length;
                rowIndex++
              ) {
                let row = processedRows[rowIndex];
                grid[rowIndex] = [];

                // Better split by & that preserves all characters
                const cellTexts = [];
                let currentCell = "";
                let inEscape = false;

                for (let i = 0; i < row.length; i++) {
                  const char = row[i];
                  const nextChar = row[i + 1] || "";

                  if (char === "\\" && !inEscape) {
                    inEscape = true;
                    currentCell += char;
                  } else if (inEscape) {
                    inEscape = false;
                    currentCell += char;
                  } else if (char === "&") {
                    cellTexts.push(currentCell);
                    currentCell = "";
                  } else {
                    currentCell += char;
                  }
                }

                // Don't forget the last cell
                if (currentCell) {
                  cellTexts.push(currentCell);
                }

                // Now process each cell text
                let colIndex = 0;

                // Support for table colored rows:
                const rowColorMatch = row.match(/\\rowcolor\{([^}]+)\}/);
                const rowColor = rowColorMatch ? rowColorMatch[1] : null;

                if (rowColor) {
                  // Remove rowcolor command from the row
                  row = row.replace(/\\rowcolor\{[^}]+\}/, "").trim();
                }

                // Add check for cell processing loop
                for (
                  let cellIndex = 0;
                  cellIndex < cellTexts.length;
                  cellIndex++
                ) {
                  // Skip positions where multispan cells are already present
                  while (colIndex < columnSpecs.length) {
                    let isOccupied = false;

                    // Check if this position is occupied by a previous multirow
                    for (const multirow of activeMultirows) {
                      if (multirow.col === colIndex) {
                        // This cell is covered by a multirow
                        grid[rowIndex][colIndex] = {
                          content: null,
                          rowSpan: 1,
                          colSpan: 1,
                          align: columnSpecs[colIndex]?.align || "center",
                          hasLeftBorder: false,
                          hasRightBorder: false,
                          isVisible: false,
                          originalRow: multirow.startRow,
                          originalCol: multirow.col,
                        };
                        colIndex++;
                        isOccupied = true;
                        break;
                      }
                    }

                    if (!isOccupied) break;
                  }

                  if (colIndex >= columnSpecs.length) break;

                  const cellText = cellTexts[cellIndex].trim();

                  // Process multirow cells
                  const multirowMatch = cellText.match(
                    /\\multirow\{(\d+)\}\{([^}]*)\}\{((?:[^{}]|\{[^}]*\})*)\}/
                  );

                  if (multirowMatch) {
                    const rowSpan = parseInt(multirowMatch[1]);
                    const content = parseInlineCommands(multirowMatch[3]);

                    // Register this multirow cell
                    activeMultirows.push({
                      rowSpan: rowSpan,
                      startRow: rowIndex,
                      col: colIndex,
                    });
                    activeMultirowCells.push({
                      rowSpan: rowSpan,
                      startRow: rowIndex,
                      col: colIndex,
                      content: content,
                    });

                    grid[rowIndex][colIndex] = {
                      content,
                      rowSpan,
                      colSpan: 1,
                      align: columnSpecs[colIndex]?.align || "center",
                      hasLeftBorder:
                        columnSpecs[colIndex]?.hasLeftBorder || false,
                      hasRightBorder:
                        columnSpecs[colIndex]?.hasRightBorder || false,
                      isVisible: true,
                      originalRow: rowIndex,
                      originalCol: colIndex,
                    };

                    colIndex++;
                    continue;
                  }

                  // Process multicolumn cells
                  const multicolMatch = cellText.match(
                    /\\multicolumn\{(\d+)\}\{([^}]*)\}\{((?:[^{}]|\{[^}]*\})*)\}/
                  );

                  if (multicolMatch) {
                    const colSpan = parseInt(multicolMatch[1]);
                    const alignStr = multicolMatch[2];
                    const content = parseInlineCommands(multicolMatch[3]);

                    let align: "left" | "center" | "right" = "center";
                    let hasLeftBorder = false;
                    let hasRightBorder = false;

                    for (let i = 0; i < alignStr.length; i++) {
                      const char = alignStr[i];
                      if (char === "|") {
                        if (i === 0) hasLeftBorder = true;
                        else if (i === alignStr.length - 1) hasRightBorder = true;
                      } else if (char === "l") align = "left";
                      else if (char === "c") align = "center";
                      else if (char === "r") align = "right";
                    }

                    grid[rowIndex][colIndex] = {
                      content,
                      rowSpan: 1,
                      colSpan,
                      align,
                      hasLeftBorder,
                      hasRightBorder,
                      isVisible: true,
                      originalRow: rowIndex,
                      originalCol: colIndex,
                    };

                    // Mark the cells that are covered by this multicolumn as not visible
                    for (let c = 1; c < colSpan; c++) {
                      if (colIndex + c < columnSpecs.length) {
                        grid[rowIndex][colIndex + c] = {
                          content: null,
                          rowSpan: 1,
                          colSpan: 1,
                          align: "center",
                          hasLeftBorder: false,
                          hasRightBorder: false,
                          isVisible: false,
                          originalRow: rowIndex,
                          originalCol: colIndex,
                        };
                      }
                    }

                    colIndex += colSpan;
                    continue;
                  }

                  // Regular cell
                  grid[rowIndex][colIndex] = {
                    content: parseInlineCommands(cellText.replace(/\\&/g, "&")),
                    rowSpan: 1,
                    colSpan: 1,
                    align: columnSpecs[colIndex]?.align || "center",
                    hasLeftBorder: columnSpecs[colIndex]?.hasLeftBorder || false,
                    hasRightBorder:
                      columnSpecs[colIndex]?.hasRightBorder || false,
                    isVisible: true,
                    originalRow: rowIndex,
                    originalCol: colIndex,
                  };

                  colIndex++;
                }

                // Fill remaining columns in this row
                while (colIndex < columnSpecs.length) {
                  let isOccupied = false;

                  // Check if this position is occupied by a previous multirow
                  for (const multirow of activeMultirows) {
                    if (multirow.col === colIndex) {
                      // This cell is covered by a multirow
                      grid[rowIndex][colIndex] = {
                        content: null,
                        rowSpan: 1,
                        colSpan: 1,
                        align: columnSpecs[colIndex]?.align || "center",
                        hasLeftBorder: false,
                        hasRightBorder: false,
                        isVisible: false,
                        originalRow: multirow.startRow,
                        originalCol: multirow.col,
                      };
                      colIndex++;
                      isOccupied = true;
                      break;
                    }
                  }

                  if (!isOccupied) {
                    // Add empty cell
                    grid[rowIndex][colIndex] = {
                      content: "",
                      rowSpan: 1,
                      colSpan: 1,
                      align: columnSpecs[colIndex]?.align || "center",
                      hasLeftBorder:
                        columnSpecs[colIndex]?.hasLeftBorder || false,
                      hasRightBorder:
                        columnSpecs[colIndex]?.hasRightBorder || false,
                      isVisible: true,
                      originalRow: rowIndex,
                      originalCol: colIndex,
                    };
                    colIndex++;
                  }
                }

                // Update active multirows for next row
                activeMultirows = activeMultirows
                  .map((mr) => ({ ...mr, rowSpan: mr.rowSpan - 1 }))
                  .filter((mr) => mr.rowSpan > 0);
              }

              // Ensure horizontalLines exists for each row
              grid.forEach((_, rowIndex) => {
                if (!horizontalLines[rowIndex]) {
                  horizontalLines[rowIndex] = {
                    top: false,
                    bottom: false,
                    clineColumns: [],
                  };
                }
              });

              // Add bottom border to the last row if not set
              if (grid.length > 0) {
                const lastRowIndex = grid.length - 1;
                horizontalLines[lastRowIndex].bottom = true;
              }

              if (grid.length === 0) {
                // Handle empty table case
                results.push(
                  <div
                    key={`empty-table-${lastIndex}`}
                    className="text-muted-foreground italic"
                  >
                    {t('table.empty')}
                  </div>
                );
                break;
              }

              // Render the table
              results.push(
                <table
                  key={`table-${lastIndex}`}
                  style={{
                    borderCollapse: "collapse",
                    margin: "1rem auto", // Changed from "1rem 0" to "1rem auto"
                    width: "auto",
                  }}
                >
                  {" "}
                  <tbody>
                    {grid.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => {
                          if (!cell.isVisible) return null;

                          return (
                            <TableCell
                              key={cellIndex}
                              content={cell.content}
                              rowSpan={cell.rowSpan}
                              colSpan={cell.colSpan}
                              align={cell.align}
                              style={{
                                borderLeft: cell.hasLeftBorder
                                  ? "1px solid currentColor"
                                  : "none",
                                borderRight: cell.hasRightBorder
                                  ? "1px solid currentColor"
                                  : "none",
                                borderTop: horizontalLines[rowIndex]?.top
                                  ? "1px solid currentColor"
                                  : "none",
                                borderBottom:
                                  horizontalLines[rowIndex]?.bottom ||
                                  (
                                    horizontalLines[rowIndex]?.clineColumns || []
                                  ).includes(cellIndex)
                                    ? "1px solid currentColor"
                                    : "none",
                                backgroundColor: "inherit", // Apply row color
                              }}
                            />
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            } catch (error) {
              console.error("Error parsing tabular:", error);
              results.push(
                <div key={`error-${lastIndex}`} className="text-destructive">
                  {t('table.renderError')}: {String(error)}
                  {process.env.NODE_ENV !== "production" && (
                    <pre className="text-xs mt-2 p-2 bg-muted overflow-auto">
                      {innerContent}
                    </pre>
                  )}
                </div>
              );
            }
            break;

          case "example":
            const [input, output] = innerContent
              .split("```")
              .map((part) => part.trim());
            results.push(
              <Example
                key={`example-${lastIndex}`}
                className="mt-1 mb-3"
                input={input}
                output={output}
              />
            );
            break;

          case "cpp":
          case "java":
          case "python":
            results.push(
              <div key={`code-${lastIndex}`}>
                <AutoFitEditor language={tag} content={innerContent.trim()} />
              </div>
            );
            break;

          case "detail":
            // Try to find an explicit \summary command - either \summary Text or \summary{Text}
            const summaryBraceMatch = innerContent.match(/\\summary\{([^}]*)\}/);
            const summaryPlainMatch = innerContent.match(/\\summary\s+([^\n\\]*)/);
            
            let summaryText = t('details.defaultSummary');
            let detailContent = innerContent;
            
            if (summaryBraceMatch) {
              // Handle \summary{Text} format
              summaryText = summaryBraceMatch[1].trim();
              detailContent = innerContent.replace(summaryBraceMatch[0], "").trim();
            } else if (summaryPlainMatch) {
              // Handle \summary Text format
              summaryText = summaryPlainMatch[1].trim();
              detailContent = innerContent.replace(summaryPlainMatch[0], "").trim();
            } else {
              // If no \summary command found, use the first line as summary
              const firstLineBreak = innerContent.indexOf('\n');
              if (firstLineBreak > 0) {
                summaryText = innerContent.substring(0, firstLineBreak).trim();
                detailContent = innerContent.substring(firstLineBreak).trim();
              }
            }

            results.push(
              <Detail 
                key={`detail-${lastIndex}`} 
                summary={summaryText}
                t={t}  // Pass translation function
              >
                {parseNestedContent(detailContent)}
              </Detail>
            );
            break;

          case "itemize":
          case "enumerate":
            // Fix: Improved handling of nested lists
            const listItems: React.ReactNode[] = [];
            const rawItemContents = innerContent.split(/\\item\s*/);
            
            // Skip first element since it's usually empty (split result before first \item)
            for (let i = 1; i < rawItemContents.length; i++) {
              const itemContent = rawItemContents[i].trim();
              if (itemContent) {
                // Check if this item has a nested environment
                let hasNestedEnv = false;
                const nestedMatch = /\\begin{(itemize|enumerate)}/.exec(itemContent);
                
                if (nestedMatch) {
                  hasNestedEnv = true;
                  // Find the matching \end for this environment
                  const envType = nestedMatch[1];
                  const startIdx = nestedMatch.index;
                  const nestedRegex = new RegExp(`\\\\end{${envType}}`, 'g');
                  
                  // Process until we find the matched end tag
                  let restContent = itemContent.slice(startIdx);
                  let nestedContent = "";
                  let balance = 1; // Track nested environments
                  let position = 0;
                  
                  while (balance > 0 && position < restContent.length) {
                    // Look for begin and end tags
                    const beginMatch = /\\begin{(itemize|enumerate)}/g;
                    const endMatch = nestedRegex;
                    
                    beginMatch.lastIndex = position;
                    nestedRegex.lastIndex = position;
                    
                    const nextBegin = beginMatch.exec(restContent);
                    const nextEnd = nestedRegex.exec(restContent);
                    
                    if (nextEnd && (!nextBegin || nextBegin.index > nextEnd.index)) {
                      // Found an end tag first
                      balance--;
                      position = nextEnd.index + nextEnd[0].length;
                    } else if (nextBegin) {
                      // Found another begin tag
                      balance++;
                      position = nextBegin.index + nextBegin[0].length;
                    } else {
                      // No more tags found, but still unbalanced
                      break;
                    }
                  }
                  
                  // Extract content before the nested environment
                  const beforeNestedContent = itemContent.slice(0, startIdx).trim();
                  
                  // Create the list item with correctly parsed content
                  listItems.push(
                    <li key={i}>
                      {beforeNestedContent && parseNestedContent(beforeNestedContent)}
                      {parseNestedContent(itemContent.slice(startIdx))}
                    </li>
                  );
                } else {
                  // Regular item without nested environments
                  listItems.push(
                    <li key={i}>{parseNestedContent(itemContent)}</li>
                  );
                }
              }
            }
            
            results.push(
              React.createElement(
                tag === "itemize" ? "ul" : "ol",
                {
                  key: `list-${lastIndex}`,
                  className: tag === "itemize" ? "list-disc pl-10" : "list-decimal pl-10",
                },
                listItems
              )
            );
            break;

          case "center":
            results.push(
              <div
                key={`center-${lastIndex}`}
                className="flex flex-col items-center text-center"
              >
                {parseNestedContent(innerContent.trim())}
              </div>
            );
            break;

          case "theorem":
          case "lemma":
          case "definition":
          case "corollary":
          case "proof":
            const theoremTitle = t(`theorems.${tag}`);
            results.push(
              <div
                key={`${tag}-${lastIndex}`}
                className="my-4 p-4 border-l-4 border-primary bg-primary/5"
              >
                <div className="font-semibold mb-2">{theoremTitle}:</div>
                <div>{parseNestedContent(innerContent.trim())}</div>
              </div>
            );
            break;
        }
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining content
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex).trim();
      if (remainingText) {
        results.push(
          <div key={`final-${lastIndex}`}>
            {parseInlineCommands(remainingText)}
          </div>
        );
      }
    }

    return results;
  };

  return parseNestedContent(text);
};

const splitAndPreserve = (content: string): string[] => {
  // First, let's identify all LaTeX environments at any nesting level
  const allEnvironments: {start: number, end: number, env: string}[] = [];
  const envStack: {type: string, start: number}[] = [];
  const envRegex = /\\(begin|end)\{([^}]+)\}/g;
  let match;
  
  // Find all begin/end tags and track their positions
  while ((match = envRegex.exec(content)) !== null) {
    const isBegin = match[1] === 'begin';
    const envType = match[2];
    
    if (isBegin) {
      // Track where this environment starts
      envStack.push({ type: envType, start: match.index });
    } else {
      // Find the matching begin for this end
      const lastBeginIndex = envStack.findLastIndex(item => item.type === envType);
      if (lastBeginIndex !== -1) {
        // Get the matching begin item
        const matchingBegin = envStack[lastBeginIndex];
        // Record this complete environment
        allEnvironments.push({
          start: matchingBegin.start,
          end: match.index + match[0].length,
          env: envType
        });
        // Remove it from the stack
        envStack.splice(lastBeginIndex, 1);
      }
    }
  }
  
  // Only identify display math regions ($$...$$) as block separators
  // Inline math ($...$) will be handled as part of its surrounding text
  const blockMathRegions: {start: number, end: number, env: string}[] = [];
  
  // Handle display math ($$...$$)
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
  while ((match = displayMathRegex.exec(content)) !== null) {
    // Verify this isn't escaped with a backslash
    const isEscaped = match.index > 0 && content[match.index - 1] === '\\';
    if (!isEscaped) {
      blockMathRegions.push({
        start: match.index,
        end: match.index + match[0].length,
        env: 'displaymath'
      });
    }
  }
  
  // Combine block-level regions and sort by starting position
  const allBlockRegions = [...allEnvironments, ...blockMathRegions].sort((a, b) => {
    // First sort by start position
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    // If same start, prioritize by length (longer regions first)
    return (b.end - b.start) - (a.end - a.start);
  });
  
  // Better handling of overlapping regions
  const nonOverlappingRegions: Array<{
    start: number;
    end: number;
    env: string;
  }> = [];
  for (const region of allBlockRegions) {
    // Check if this region is contained within any already accepted region
    const isContained = nonOverlappingRegions.some(
      accepted => accepted.start <= region.start && accepted.end >= region.end
    );
    
    if (!isContained) {
      // Remove any previously accepted regions that are fully contained in this one
      const filteredRegions = nonOverlappingRegions.filter(
        accepted => !(region.start <= accepted.start && region.end >= accepted.end)
      );
      
      // Add this region
      filteredRegions.push(region);
      nonOverlappingRegions.length = 0;
      nonOverlappingRegions.push(...filteredRegions);
    }
  }
  
  // If no special regions found, split by paragraphs as before
  if (nonOverlappingRegions.length === 0) {
    return content.split(/\n\s*\n/)
      .map(part => part.trim())
      .filter(part => part.length > 0);
  }
  
  // Split content while preserving all block regions
  const parts: string[] = [];
  let lastEnd = 0;
  
  // Process segments between block regions
  for (const region of nonOverlappingRegions) {
    // Add text before this region (if any)
    if (region.start > lastEnd) {
      const textBefore = content.substring(lastEnd, region.start).trim();
      if (textBefore) {
        // Split by double line breaks (paragraphs)
        const textParts = textBefore.split(/\n\s*\n/)
          .map(part => part.trim())
          .filter(part => part.length > 0);
        parts.push(...textParts);
      }
    }
    
    // Add this special region as a whole
    parts.push(content.substring(region.start, region.end));
    lastEnd = region.end;
  }
  
  // Add any remaining content after the last block region
  if (lastEnd < content.length) {
    const textAfter = content.substring(lastEnd).trim();
    if (textAfter) {
      // Split by double line breaks (paragraphs)
      const textParts = textAfter.split(/\n\s*\n/)
        .map(part => part.trim())
        .filter(part => part.length > 0);
      parts.push(...textParts);
    }
  }
  
  return parts.filter(part => part.length > 0);
};

export function RenderMathJaxText({ content }: { content: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('MathJax'); // Get translations at component level

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pass the translation function to parseLaTeXToReact
  const processedContent = useMemo(() => 
    splitAndPreserve(content).map((text, id) => (
      <div key={id}>{parseLaTeXToReact(text, t)}</div>
    )), 
    [content, t] // Add t to dependencies
  );

  return (
    <MathJaxContext config={config}>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        <div className="space-y-2">{processedContent}</div>
      )}
    </MathJaxContext>
  );

}
