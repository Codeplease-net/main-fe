import { useTranslations } from "next-intl";

interface Category {
  code: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}
  
export default function categories(): Category[] {
  const t = useTranslations('Topics');
  return [
    // Basic Algorithm Paradigms
    { code: "2-pointers", name: t("Two pointers"), description: t("TwoPointersDesc"), difficulty: 'Intermediate' },
    { code: "2-sat", name: t("2-satisfiability"), description: t("2SatDesc"), difficulty: 'Advanced' },
    { code: "ad-hoc", name: t("Ad hoc"), description: t("AdHocDesc"), difficulty: 'Beginner' },
    { code: "constructive", name: t("Constructive algorithms"), description: t("ConstructiveDesc"), difficulty: 'Intermediate' },
    { code: "divide-conquer", name: t("Divide & Conquer"), description: t("DivideConquerDesc"), difficulty: 'Intermediate' },
    { code: "greedy", name: t("Greedy algorithms"), description: t("GreedyDesc"), difficulty: 'Intermediate' },
    { code: "binary-search", name: t("Binary search"), description: t("BinarySearchDesc"), difficulty: 'Intermediate' },
    { code: "brute-force", name: t("Brute Force"), description: t("BruteForceDesc"), difficulty: 'Beginner' },
    
    // Data Structures
    { code: "balanced-bst", name: t("Balanced Binary Search Tree"), description: t("BalancedBSTDesc"), difficulty: 'Advanced' },
    { code: "stl", name: t("C++ STL"), description: t("STLDesc"), difficulty: 'Beginner' },
    { code: "dsu", name: t("Disjoint Set Union"), description: t("DSUDesc"), difficulty: 'Intermediate' },
    { code: "fenwick", name: t("Fenwick Tree"), description: t("FenwickDesc"), difficulty: 'Intermediate' },
    { code: "fenwick-2d", name: t("2D Fenwick Tree"), description: t("Fenwick2DDesc"), difficulty: 'Advanced' },
    { code: "segment-tree", name: t("Segment Tree"), description: t("SegmentTreeDesc"), difficulty: 'Intermediate' },
    { code: "ds", name: t("Data Structure"), description: t("DSDesc"), difficulty: 'Intermediate' },
    { code: "rmq", name: t("Range Minimum Query"), description: t("RMQDesc"), difficulty: 'Intermediate' },
    { code: "trie", name: t("Trie"), description: t("TrieDesc"), difficulty: 'Intermediate' },
    
    // Graph Algorithms
    { code: "dfs-bfs", name: t("DFS / BFS"), description: t("DFSBFSDesc"), difficulty: 'Intermediate' },
    { code: "traversal", name: t("Traversal"), description: t("TraversalDesc"), difficulty: 'Beginner' },
    { code: "graph", name: t("Graph theory"), description: t("GraphDesc"), difficulty: 'Advanced' },
    { code: "dijkstra", name: t("Shortest path - Dijkstra"), description: t("DijkstraDesc"), difficulty: 'Intermediate' },
    { code: "floyd-warshall", name: t("Shortest path - Floyd-Warshall"), description: t("FloydWarshallDesc"), difficulty: 'Intermediate' },
    { code: "matching", name: t("Matching"), description: t("MatchingDesc"), difficulty: 'Advanced' },
    { code: "weighted-matching", name: t("Weighted matching"), description: t("WeightedMatchingDesc"), difficulty: 'Advanced' },
    { code: "general-matching", name: t("Matching on general graphs"), description: t("GeneralMatchingDesc"), difficulty: 'Advanced' },
    { code: "mst", name: t("Minimum spanning tree"), description: t("MSTDesc"), difficulty: 'Intermediate' },
    { code: "eulerian", name: t("Eulerian cycle"), description: t("EulerianDesc"), difficulty: 'Advanced' },
    { code: "lca", name: t("Lowest Common Ancestor"), description: t("LCADesc"), difficulty: 'Advanced' },
    { code: "link-cut-tree", name: t("Link-Cut Tree"), description: t("LinkCutTreeDesc"), difficulty: 'Advanced' },
    { code: "hld", name: t("Heavy-Light Decomposition"), description: t("HLDDesc"), difficulty: 'Advanced' },
    { code: "tree", name: t("Tree"), description: t("TreeDesc"), difficulty: 'Intermediate' },
    
    // Advanced Techniques
    { code: "sqrt-decomp", name: t("Square root decomposition"), description: t("SqrtDecompDesc"), difficulty: 'Advanced' },
    { code: "meet-in-the-middle", name: t("Meet in the middle"), description: t("MeetInTheMiddleDesc"), difficulty: 'Advanced' },
    { code: "fft", name: t("Fast Fourier Transform"), description: t("FFTDesc"), difficulty: 'Advanced' },
    { code: "sweep-line", name: t("Sweep line algorithm"), description: t("SweepLineDesc"), difficulty: 'Advanced' },
    { code: "coordinate-compression", name: t("Coordinate compression"), description: t("CoordinateCompressionDesc"), difficulty: 'Intermediate' },
    
    // String Processing
    { code: "string", name: t("Strings"), description: t("StringDesc"), difficulty: 'Beginner' },
    { code: "aho-corasick", name: t("Aho-Corasick"), description: t("AhoCorasickDesc"), difficulty: 'Advanced' },
    { code: "kmp", name: t("Knuth-Morris-Pratt"), description: t("KMPDesc"), difficulty: 'Intermediate' },
    { code: "manacher", name: t("Manacher's algorithm"), description: t("ManacherDesc"), difficulty: 'Advanced' },
    { code: "suffix", name: t("Suffix Array / Suffix Automaton / Suffix Tree"), description: t("SuffixDesc"), difficulty: 'Advanced' },
    { code: "z-function", name: t("Z-function"), description: t("ZFunctionDesc"), difficulty: 'Intermediate' },
    { code: "hashing", name: t("Hashing"), description: t("HashingDesc"), difficulty: 'Intermediate' },
    
    // Dynamic Programming
    { code: "dp", name: t("Dynamic programming"), description: t("DPDesc"), difficulty: 'Advanced' },
    { code: "convex-hull-trick", name: t("Convex hull trick"), description: t("ConvexHullTrickDesc"), difficulty: 'Advanced' },
    { code: "bitmask-dp", name: t("Bitmask dynamic programming"), description: t("BitmaskDPDesc"), difficulty: 'Advanced' },
    { code: "digit-dp", name: t("Digit dynamic programming"), description: t("DigitDPDesc"), difficulty: 'Advanced' },
    { code: "lexico-dp", name: t("Lexicographic order dynamic programming"), description: t("LexicoDPDesc"), difficulty: 'Advanced' },
    { code: "tree-dp", name: t("Dynamic programming on trees"), description: t("TreeDPDesc"), difficulty: 'Advanced' },
    { code: "knuth-opt", name: t("Knuth Optimization"), description: t("KnuthOptDesc"), difficulty: 'Advanced' },
    
    // Mathematics
    { code: "number-theory", name: t("Number theory"), description: t("NumberTheoryDesc"), difficulty: 'Advanced' },
    { code: "math", name: t("Mathematics"), description: t("MathDesc"), difficulty: 'Intermediate' },
    { code: "combinatorics", name: t("Combinatorics"), description: t("CombinatoricsDesc"), difficulty: 'Advanced' },
    { code: "generating-functions", name: t("Generating functions"), description: t("GeneratingFunctionsDesc"), difficulty: 'Advanced' },
    { code: "gaussian-elim", name: t("Gaussian elimination"), description: t("GaussianEliminDesc"), difficulty: 'Advanced' },
    { code: "matrix-mult", name: t("Matrix multiplication"), description: t("MatrixMultDesc"), difficulty: 'Intermediate' },
    { code: "large-numbers", name: t("Large number arithmetic"), description: t("LargeNumbersDesc"), difficulty: 'Intermediate' },
    { code: "crt", name: t("Chinese Remainder Theorem"), description: t("CRTDesc"), difficulty: 'Advanced' },
    { code: "probabilities", name: t("Probabilities"), description: t("ProbabilitiesDesc"), difficulty: 'Advanced' },
    
    // Geometry
    { code: "geometry", name: t("Geometry"), description: t("GeometryDesc"), difficulty: 'Advanced' },
    { code: "convex-hull", name: t("Convex hull"), description: t("ConvexHullDesc"), difficulty: 'Advanced' },
    
    // Game Theory
    { code: "games", name: t("Games"), description: t("GamesDesc"), difficulty: 'Intermediate' },
    { code: "game-ad-hoc", name: t("Game theory - Ad hoc"), description: t("GameAdHocDesc"), difficulty: 'Advanced' },
    { code: "grundy", name: t("Game theory - Grundy numbers"), description: t("GrundyDesc"), difficulty: 'Advanced' },
    { code: "nim", name: t("Game theory - Nim game"), description: t("NimDesc"), difficulty: 'Advanced' },
    
    // Bitwise & Flow
    { code: "bit", name: t("Bitwise operations"), description: t("BitDesc"), difficulty: 'Intermediate' },
    { code: "network-flow", name: t("Network flow"), description: t("NetworkFlowDesc"), difficulty: 'Advanced' },
    { code: "min-cost-flow", name: t("Minimum-cost flow"), description: t("MinCostFlowDesc"), difficulty: 'Advanced' },
    
    // Other Techniques
    { code: "prefix-sum", name: t("Prefix sum array"), description: t("PrefixSumDesc"), difficulty: 'Beginner' },
    { code: "monotonic-queue", name: t("Monotonic Queue"), description: t("MonotonicQueueDesc"), difficulty: 'Intermediate' },
    { code: "interactive", name: t("Interactive problems"), description: t("InteractiveDesc"), difficulty: 'Advanced' },
    { code: "output-only", name: t("Output-only problems"), description: t("OutputOnlyDesc"), difficulty: 'Intermediate' },
    { code: "unclassified", name: t("Unclassified"), description: t("UnclassifiedDesc"), difficulty: 'Intermediate' },
    { code: "search", name: t("Search"), description: t("SearchDesc"), difficulty: 'Beginner' },
    { code: "sort", name: t("Sort"), description: t("SortDesc"), difficulty: 'Beginner' },
    { code: "ternary-search", name: t("Ternary Search"), description: t("TernarySearchDesc"), difficulty: 'Advanced' },
    { code: "matrix", name: t("Matrix"), description: t("MatrixDesc"), difficulty: 'Advanced' }
  ];
}
