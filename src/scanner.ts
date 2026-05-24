import { execSync } from 'child_process';
import { GitStatusEntry, ScannerOptions } from './types';

export class GitScanner {
  private repoPath: string;

  constructor(repoPath: string, _options: ScannerOptions = {}) {
    this.repoPath = repoPath;
  }

  scan(): GitStatusEntry[] {
    const entries: GitStatusEntry[] = [];

    try {
      const output = execSync('git status --porcelain', {
        cwd: this.repoPath,
        encoding: 'utf-8',
      });

      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (line.length >= 3) {
          entries.push({
            status: line.substring(0, 2).trim(),
            path: line.substring(3),
          });
        }
      }
    } catch {
      throw new Error('Not a git repository or git not available');
    }

    return entries;
  }

  getUntrackedFiles(): string[] {
    const entries = this.scan();
    return entries
      .filter((entry) => entry.status === '??')
      .map((entry) => entry.path);
  }

  isGitRepo(): boolean {
    try {
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: this.repoPath,
        encoding: 'utf-8',
      });
      return true;
    } catch {
      return false;
    }
  }
}