import { PatternSuggestion } from './types';

export class PatternDetector {
  private commonPatterns: Map<string, PatternSuggestion>;

  constructor() {
    this.commonPatterns = new Map([
      [
        'node_modules/',
        {
          pattern: 'node_modules/',
          confidence: 0.95,
          description: 'Node.js dependencies directory',
          category: 'dependencies',
          examples: ['node_modules/lodash/', 'node_modules/react/'],
        },
      ],
      [
        '*.log',
        {
          pattern: '*.log',
          confidence: 0.85,
          description: 'Log files',
          category: 'logs',
          examples: ['error.log', 'debug.log', 'server.log'],
        },
      ],
      [
        '.DS_Store',
        {
          pattern: '.DS_Store',
          confidence: 0.95,
          description: 'macOS system files',
          category: 'system',
          examples: ['.DS_Store'],
        },
      ],
      [
        'Thumbs.db',
        {
          pattern: 'Thumbs.db',
          confidence: 0.9,
          description: 'Windows thumbnail cache',
          category: 'system',
          examples: ['Thumbs.db'],
        },
      ],
      [
        'dist/',
        {
          pattern: 'dist/',
          confidence: 0.88,
          description: 'Distribution build directory',
          category: 'build',
          examples: ['dist/bundle.js', 'dist/index.html'],
        },
      ],
      [
        'build/',
        {
          pattern: 'build/',
          confidence: 0.88,
          description: 'Build output directory',
          category: 'build',
          examples: ['build/main.js', 'build/assets/'],
        },
      ],
      [
        '.env.local',
        {
          pattern: '.env.local',
          confidence: 0.92,
          description: 'Local environment variables',
          category: 'config',
          examples: ['.env.local', '.env.development.local'],
        },
      ],
      [
        'coverage/',
        {
          pattern: 'coverage/',
          confidence: 0.85,
          description: 'Test coverage reports',
          category: 'build',
          examples: ['coverage/lcov.info', 'coverage/'],
        },
      ],
      [
        '*.tmp',
        {
          pattern: '*.tmp',
          confidence: 0.75,
          description: 'Temporary files',
          category: 'project-specific',
          examples: ['temp.tmp', 'cache.tmp'],
        },
      ],
      [
        '.cache/',
        {
          pattern: '.cache/',
          confidence: 0.8,
          description: 'Cache directories',
          category: 'project-specific',
          examples: ['.cache/', '.cache/bundler/'],
        },
      ],
      [
        '.next/',
        {
          pattern: '.next/',
          confidence: 0.9,
          description: 'Next.js build output',
          category: 'build',
          examples: ['.next/', '.next/static/'],
        },
      ],
      [
        '.nuxt/',
        {
          pattern: '.nuxt/',
          confidence: 0.9,
          description: 'Nuxt.js build output',
          category: 'build',
          examples: ['.nuxt/', '.nuxt/dist/'],
        },
      ],
      [
        '.out/',
        {
          pattern: '.out/',
          confidence: 0.85,
          description: 'Output directory (various frameworks)',
          category: 'build',
          examples: ['.out/', '.out/index.html'],
        },
      ],
      [
        'target/',
        {
          pattern: 'target/',
          confidence: 0.88,
          description: 'Java/Rust/Cargo build output',
          category: 'build',
          examples: ['target/', 'target/debug/'],
        },
      ],
      [
        'venv/',
        {
          pattern: 'venv/',
          confidence: 0.9,
          description: 'Python virtual environment',
          category: 'dependencies',
          examples: ['venv/', 'venv/lib/'],
        },
      ],
      [
        '.venv/',
        {
          pattern: '.venv/',
          confidence: 0.9,
          description: 'Python virtual environment (dot prefix)',
          category: 'dependencies',
          examples: ['.venv/', '.venv/lib/'],
        },
      ],
      [
        '__pycache__/',
        {
          pattern: '__pycache__/',
          confidence: 0.88,
          description: 'Python bytecode cache',
          category: 'build',
          examples: ['__pycache__/', '__pycache__/module.pyc'],
        },
      ],
      [
        '*.pyc',
        {
          pattern: '*.pyc',
          confidence: 0.85,
          description: 'Python compiled files',
          category: 'build',
          examples: ['main.pyc', 'utils.pyc'],
        },
      ],
      [
        'vendor/',
        {
          pattern: 'vendor/',
          confidence: 0.85,
          description: 'Vendor dependencies',
          category: 'dependencies',
          examples: ['vendor/', 'vendor/laravel/'],
        },
      ],
      [
        '.idea/',
        {
          pattern: '.idea/',
          confidence: 0.9,
          description: 'IntelliJ IDEA project files',
          category: 'system',
          examples: ['.idea/', '.idea/workspace.xml'],
        },
      ],
      [
        '.vscode/',
        {
          pattern: '.vscode/',
          confidence: 0.9,
          description: 'VS Code workspace files',
          category: 'system',
          examples: ['.vscode/', '.vscode/settings.json'],
        },
      ],
    ]);
  }

  detect(untrackedFiles: string[]): PatternSuggestion[] {
    const suggestions = new Map<string, PatternSuggestion>();
    const fileCounts = new Map<string, number>();

    for (const file of untrackedFiles) {
      const matchedPatterns = this.matchFileToPattern(file);

      for (const pattern of matchedPatterns) {
        const current = suggestions.get(pattern);
        const count = (fileCounts.get(pattern) || 0) + 1;
        fileCounts.set(pattern, count);

        if (current) {
          current.examples.push(file);
          current.confidence = Math.min(0.99, current.confidence + 0.05 * count);
        } else {
          const template = this.commonPatterns.get(pattern);
          if (template) {
            suggestions.set(pattern, {
              ...template,
              examples: [file],
              confidence: Math.min(0.99, template.confidence + 0.05 * count),
            });
          }
        }
      }
    }

    return Array.from(suggestions.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private matchFileToPattern(filePath: string): string[] {
    const patterns: string[] = [];

    for (const [pattern] of this.commonPatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    if (pattern.endsWith('/')) {
      return filePath.startsWith(pattern) || filePath.startsWith(`./${pattern}`);
    }

    if (pattern.startsWith('*.')) {
      const ext = pattern.substring(2);
      const name = filePath.split('/').pop() || '';
      return name.endsWith(`.${ext}`);
    }

    if (pattern.startsWith('.')) {
      const name = filePath.split('/').pop() || '';
      if (name === pattern) {
        return true;
      }
      if (name.startsWith(pattern.replace('.*', '.').replace('*', ''))) {
        return true;
      }
    }

    return filePath === pattern;
  }
}