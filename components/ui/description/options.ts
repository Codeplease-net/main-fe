export const THEMES = {
  "custom-vs-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#020817",
      "editor.lineHighlightBackground": "#1a2234",
      "editorCursor.foreground": "#7c85f3",
      "editor.selectionBackground": "#2a3957",
    },
  },
  "github-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0d1117",
      "editor.lineHighlightBackground": "#161b22",
      "editorCursor.foreground": "#58a6ff",
      "editor.selectionBackground": "#1f2937",
    },
  },
  monokai: {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#272822",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorCursor.foreground": "#f8f8f2",
      "editor.selectionBackground": "#49483e",
    },
  },
  "mathjax-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955" },
      { token: "comment.content", foreground: "6A9955" },
      { token: "delimiter", foreground: "808080" },
      { token: "delimiter.angle", foreground: "808080" },
      { token: "tag.name", foreground: "569CD6" },
      { token: "attribute.name", foreground: "9CDCFE" },
      { token: "attribute.value", foreground: "CE9178" },
      { token: "tag.href", foreground: "569CD6", fontStyle: "bold" },
      { token: "string.link", foreground: "3DC9B0" },
      { token: "math.inline", foreground: "FF9D00", fontStyle: "italic" },
      { token: "math.block", foreground: "DCDCAA", fontStyle: "italic" },
      { token: "content", foreground: "D4D4D4" },
      { token: "heading1", foreground: "FF0000", fontStyle: "bold" },
      { token: "heading2", foreground: "FF4500", fontStyle: "bold" },
      { token: "heading3", foreground: "FF6347", fontStyle: "bold" },
      { token: "heading4", foreground: "FF7F50", fontStyle: "bold" },
      { token: "heading5", foreground: "FFA07A", fontStyle: "bold" },
      { token: "heading6", foreground: "FFD700", fontStyle: "bold" },
    ],
    colors: {
      "editor.background": "#020817",
      "editor.lineHighlightBackground": "#1a2234",
      "editorCursor.foreground": "#7c85f3",
      "editor.selectionBackground": "#2a3957",
    },
  },
  "mathjax-light": {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "008000" },
      { token: "comment.content", foreground: "008000" },
      { token: "tag.name", foreground: "800000" },
      { token: "delimiter.angle", foreground: "666666" },
      { token: "attribute.name", foreground: "FF0000" },
      { token: "attribute.value", foreground: "0000FF" },
      { token: "delimiter", foreground: "666666" },
      { token: "math.inline", foreground: "B31111", fontStyle: "italic" },
      { token: "math.block", foreground: "AA00AA", fontStyle: "italic" },
      { token: "content", foreground: "000000" },
      { token: "heading1", foreground: "FF0000", fontStyle: "bold" },
      { token: "heading2", foreground: "FF4500", fontStyle: "bold" },
      { token: "heading3", foreground: "FF6347", fontStyle: "bold" },
      { token: "heading4", foreground: "FF7F50", fontStyle: "bold" },
      { token: "heading5", foreground: "FFA07A", fontStyle: "bold" },
      { token: "heading6", foreground: "FFD700", fontStyle: "bold" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.lineHighlightBackground": "#F0F0F0",
      "editorCursor.foreground": "#000000",
      "editor.selectionBackground": "#D0D0D0",
    },
  },
};

export const languageConfigurationMathJaxLatex: import('monaco-editor').languages.LanguageConfiguration = {
  comments: {
    lineComment: '%'
  },
  brackets: [
    ['{', '}'] as [string, string],
    ['[', ']'] as [string, string],
    ['(', ')'] as [string, string]
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '$', close: '$' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '$', close: '$' }
  ]
}

export const monarchTokensProviderMathJaxLatex = {
  defaultToken: 'content',
  tokenizer: {
    root: [
      [/\\[a-zA-Z]+/, 'keyword'],
      [/%.*$/, 'comment'],
      [/\$[^$]*\$/, 'math.inline'],
      [/\$\$[^$]*\$\$/, 'math.block'],
      [/[{}()\[\]]/, '@brackets'],
      [/[0-9]+/, 'number'],
      [/[&^_]/, 'operator'],
      [/[a-zA-Z]+/, 'identifier'],
      [/^# (.*)$/, 'heading1'],
      [/^## (.*)$/, 'heading2'],
      [/^### (.*)$/, 'heading3'],
      [/^#### (.*)$/, 'heading4'],
      [/^##### (.*)$/, 'heading5'],
      [/^###### (.*)$/, 'heading6'],
    ]
  }
} as import('monaco-editor').languages.IMonarchLanguage

export function completionItemProviderMathJaxLatex(monaco: typeof import('monaco-editor')) {
  return {
    provideCompletionItems: (model: { getValueInRange: (arg0: { startLineNumber: any; startColumn: number; endLineNumber: any; endColumn: any; }) => any; }, position: { lineNumber: any; column: number; }) => {
      // Get the current line up to the cursor position
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      // Find the start of the current command (after the last \)
      const match = textUntilPosition.match(/\\[a-zA-Z]*$/);
      
      // Calculate the range to replace
      const word = match ? match[0] : '';
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - word.length,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };

      // Base suggestions array
      const baseSuggestions = [
        {
          label: '\\bf',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\bf{${1:text}}',
          documentation: 'Bold text'
        },

      {
        label: '\\bf',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: '\\bf{${1:text}}',
        documentation: 'Bold text'
      },
      {
          label: '\\textbf',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\textbf{${1:text}}',
          documentation: 'Bold text'
      },
      {
        label: '\\it',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: '\\it{${1:text}}',
        documentation: 'Italic text'
      },
      {
          label: '\\textit',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\textit{${1:text}}',
          documentation: 'Italic text'
      },
      {
          label: '\\t',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\t{${1:text}}',
          documentation: 'Monospace text'
      },
      {
          label: '\\tt',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\tt{${1:text}}',
          documentation: 'Monospace text'
        },
        {
          label: '\\texttt',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\texttt{${1:text}}',
          documentation: 'Monospace text'
        },
        {
          label: '\\emph',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\emph{${1:text}}',
          documentation: 'Emphasize text'
        },
        {
          label: '\\underline',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\underline{${1:text}}',
          documentation: 'Underline text'
        },
        {
          label: '\\sout',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\sout{${1:text}}',
          documentation: 'Strikethrough text'
        },
        {
          label: '\\textsc',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\textsc{${1:text}}',
          documentation: 'Small caps text'
        },
        {
          label: '\\tiny',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\tiny{${1:text}}',
          documentation: 'Tiny text'
        },
        {
          label: '\\scriptsize',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\scriptsize{${1:text}}',
          documentation: 'Script size text'
        },
        {
          label: '\\small',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\small{${1:text}}',
          documentation: 'Small text'
        },
        {
          label: '\\normalsize',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\normalsize{${1:text}}',
          documentation: 'Normal size text'
        },
        {
          label: '\\large',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\large{${1:text}}',
          documentation: 'Large text'
        },
        {
          label: '\\Large',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\Large{${1:text}}',
          documentation: 'Larger text'
        },
        {
          label: '\\LARGE',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\LARGE{${1:text}}',
          documentation: 'Even larger text'
        },
        {
          label: '\\huge',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\huge{${1:text}}',
          documentation: 'Huge text'
        },
        {
          label: '\\HUGE',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\HUGE{${1:text}}',
          documentation: 'Hugest text'
        },
        {
          label: '\\url',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\url{${1:link}}',
          documentation: 'URL'
        },
        {
          label: '\\href{}{}',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: '\\href{${1:link}}{${2:text}}',
          documentation: 'HREF'
        },
      {
        label: '\\begin{itemize} \\end{itemize}',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '\\begin{itemize}\n\t\\item \n\\end{itemize}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Itemize list'
      },
      {
        label: '\\begin{center} \\end{center}',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '\\begin{center}\n \n\\end{center}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Center Text'
      },
      {
        label: '\\begin{detail} \\end{detail}',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '\\begin{detail}\n\t\\summary \n\\end{detail}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Create Detail'
      },
      {
        label: '\\begin{example} \\end{example}',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '\\begin{example}\n \n\\end{example}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Create Example'
      },
      {
        label: '\\begin{enumerate} \\end{enumerate}',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '\\begin{enumerate}\n\t\\item \n\\end{enumerate}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Enumerate list'
      },
      {
        label: '\\begin{cpp} \\end{cpp}',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '\\begin{cpp}\n\t\n\\end{cpp}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'CPP'
      },
      {
          label: '\\begin{java} \\end{java}',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{java}\n\t${1:code}\n\\end{java}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Java code block'
        },
        {
          label: '\\begin{python}    \\end{python}',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{python}\n\t${1:code}\n\\end{python}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Python code block'
        },
        {
          label: '\\begin{python}    \\end{python}',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '\\begin{python}\n\t${1:code}\n\\end{python}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Python code block'
        },
      ];

      // Add the range property to each suggestion
      const suggestions = baseSuggestions.map(suggestion => ({
        ...suggestion,
        range: range
      }));

      return { suggestions };
    },
    triggerCharacters: ["\\"]
  };
}