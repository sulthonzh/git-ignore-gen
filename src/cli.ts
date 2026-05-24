#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { GitScanner } from './scanner';
import { PatternDetector } from './pattern-detector';
import { GitignoreGenerator } from './generator';

const program = new Command();

program
  .name('git-ignore-gen')
  .description('Interactive CLI that scans your project and suggests .gitignore patterns')
  .version('1.0.0')
  .option('-i, --interactive', 'Interactive mode with pattern selection')
  .option('-u, --update', 'Update existing .gitignore instead of overwriting')
  .option('-d, --dry-run', 'Show suggestions without writing files')
  .option('-p, --path <path>', 'Path to git repository', process.cwd())
  .action(async (options) => {
    const repoPath = options.path;

    const spinner = ora('Checking git repository...').start();

    const scanner = new GitScanner(repoPath);

    if (!scanner.isGitRepo()) {
      spinner.fail(chalk.red('Not a git repository'));
      process.exit(1);
    }

    spinner.succeed(chalk.green('Git repository detected'));

    const scanSpinner = ora('Scanning for untracked files...').start();

    let untrackedFiles: string[];
    try {
      untrackedFiles = scanner.getUntrackedFiles();
      scanSpinner.succeed(chalk.green(`Found ${untrackedFiles.length} untracked files`));
    } catch {
      scanSpinner.fail(chalk.red('Failed to scan repository'));
      process.exit(1);
    }

    if (untrackedFiles.length === 0) {
      console.log(chalk.yellow('\nNo untracked files found. Repository is clean!'));
      process.exit(0);
    }

    const detectSpinner = ora('Detecting patterns...').start();

    const detector = new PatternDetector();
    const suggestions = detector.detect(untrackedFiles);

    detectSpinner.succeed(chalk.green(`Detected ${suggestions.length} potential patterns`));

    if (suggestions.length === 0) {
      console.log(chalk.yellow('\nNo patterns detected from untracked files.'));
      process.exit(0);
    }

    console.log(chalk.blue('\n📋 Detected Patterns:\n'));

    for (const suggestion of suggestions) {
      const confidenceBar = '█'.repeat(Math.floor(suggestion.confidence * 10));
      const confidenceSpaces = ' '.repeat(10 - confidenceBar.length);
      console.log(chalk.cyan(`  ${suggestion.pattern}`));
      console.log(chalk.gray(`    ${suggestion.description}`));
      console.log(chalk.gray(`    Confidence: [${chalk.green(confidenceBar)}${confidenceSpaces}] ${Math.round(suggestion.confidence * 100)}%`));
      console.log(chalk.gray(`    Examples: ${suggestion.examples.slice(0, 2).join(', ')}`));
      console.log('');
    }

    let selectedSuggestions = suggestions;

    if (options.interactive) {
      const { patterns } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'patterns',
          message: 'Select patterns to include in .gitignore:',
          choices: suggestions.map((s) => ({
            name: `${s.pattern} - ${s.description} (${Math.round(s.confidence * 100)}%)`,
            value: s.pattern,
            checked: true,
          })),
        },
      ]);

      selectedSuggestions = suggestions.filter((s) => patterns.includes(s.pattern));
    }

    if (selectedSuggestions.length === 0) {
      console.log(chalk.yellow('\nNo patterns selected. Exiting...'));
      process.exit(0);
    }

    const generator = new GitignoreGenerator(repoPath);
    const content = await generator.generate(selectedSuggestions);

    console.log(chalk.blue('\n📄 Generated .gitignore:\n'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(content);
    console.log(chalk.gray('─'.repeat(60)));

    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  Dry run mode - no files written'));
      console.log(chalk.gray('Run without --dry-run to write .gitignore'));
      process.exit(0);
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: options.update
          ? 'Update existing .gitignore?'
          : 'Write to .gitignore?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nCancelled. No files written.'));
      process.exit(0);
    }

    const writeSpinner = ora('Writing .gitignore...').start();

    try {
      await generator.writeGitignore(selectedSuggestions, {
        dryRun: false,
        update: options.update,
      });
      writeSpinner.succeed(chalk.green('.gitignore written successfully'));
    } catch {
      writeSpinner.fail(chalk.red('Failed to write .gitignore'));
      process.exit(1);
    }

    console.log(chalk.green(`\n✅ Added ${selectedSuggestions.length} patterns to .gitignore`));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  1. Review the generated .gitignore file'));
    console.log(chalk.gray('  2. Run "git status" to verify ignored files'));
    console.log(chalk.gray('  3. Commit the changes'));
  });

program.parse(process.argv);