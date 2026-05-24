export interface PatternSuggestion {
  pattern: string;
  confidence: number;
  description: string;
  category: 'build' | 'dependencies' | 'system' | 'project-specific' | 'logs' | 'config';
  examples: string[];
}

export interface ScanResult {
  untrackedFiles: string[];
  suggestions: PatternSuggestion[];
  repoPath: string;
}

export interface GitStatusEntry {
  status: string;
  path: string;
}

export interface ScannerOptions {
  includeIgnored?: boolean;
  maxDepth?: number;
  excludePatterns?: string[];
}