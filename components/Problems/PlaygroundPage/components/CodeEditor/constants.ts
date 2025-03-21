/**
 * Initial template comments for each supported language
 */
export const INITIAL_COMMENTS = {
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Fast I/O
    setbuf(stdout, NULL);
    
    // Your code here
    
    return 0;
}
`,
  cpp11: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Your code here
    
    return 0;
}
`,
  cpp14: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Your code here
    
    return 0;
}
`,
  cpp17: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Your code here
    
    return 0;
}
`,
  cpp20: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Your code here
    
    return 0;
}
`,
  python2: `#!/usr/bin/env python
import sys

# Fast I/O
input = sys.stdin.readline

# Your code here

`,
  python3: `#!/usr/bin/env python3
import sys

# Fast I/O
input = sys.stdin.readline

# Your code here

`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st;
        
        // Your code here
    }
}
`,
  
  // Keep the generic ones for backward compatibility
  python: `#!/usr/bin/env python3
import sys

# Fast I/O
input = sys.stdin.readline

# Your code here

`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Your code here
    
    return 0;
}
`
};
  
/**
 * Monaco editor theme definitions
 */
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
};