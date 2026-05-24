# git-ignore-gen

Interactive CLI that scans your project for untracked files and suggests .gitignore patterns based on actual project state.

## Features

- **Project-aware scanning**: Analyzes `git status` to identify untracked files
- **Smart pattern detection**: Suggests ignore rules based on file extensions, naming patterns, and directory structures
- **Interactive selection**: Presents detected patterns with explanations and allows selective inclusion
- **High confidence matching**: Uses pattern recognition with confidence scoring
- **Category grouping**: Organizes patterns by type (dependencies, build, logs, system, etc.)
- **Safe operations**: Supports dry-run mode and update mode to preserve existing .gitignore

## Installation

```bash
npm install -g git-ignore-gen
```

Or run directly with npx:

```bash
npx git-ignore-gen
```

## Usage

### Basic Usage

Scan your current directory and show suggested patterns:

```bash
git-ignore-gen
```

### Interactive Mode

Select which patterns to include interactively:

```bash
git-ignore-gen --interactive
```

### Update Existing .gitignore

Add new patterns to an existing .gitignore file:

```bash
git-ignore-gen --update
```

### Dry Run

Preview suggestions without writing files:

```bash
git-ignore-gen --dry-run
```

### Custom Path

Scan a specific repository:

```bash
git-ignore-gen --path /path/to/repo
```

## Example Output

```
🔍 Checking git repository...
✓ Git repository detected
✓ Found 15 untracked files
✓ Detected 6 potential patterns

📋 Detected Patterns:

  node_modules/
    Node.js dependencies directory
    Confidence: [██████████] 95%
    Examples: node_modules/lodash/, node_modules/react/

  *.log
    Log files
    Confidence: [████████░░] 85%
    Examples: error.log, debug.log

  dist/
    Distribution build directory
    Confidence: [████████░░] 88%
    Examples: dist/bundle.js, dist/index.html

✅ Added 6 patterns to .gitignore
```

## How It Works

1. **Scans git status**: Reads untracked files from your repository
2. **Detects patterns**: Matches files against common ignore patterns
3. **Scores confidence**: Ranks patterns based on match frequency
4. **Generates .gitignore**: Creates organized, commented .gitignore file

## Supported Patterns

The tool recognizes common patterns for:

- **Dependencies**: `node_modules/`, `vendor/`
- **Build artifacts**: `dist/`, `build/`, `.next/`, `.nuxt/`, `target/`
- **Logs**: `*.log`
- **System files**: `.DS_Store`, `Thumbs.db`
- **Config**: `.env.local`
- **Test coverage**: `coverage/`
- **Cache**: `.cache/`

## Options

```
Usage: git-ignore-gen [options]

Options:
  -i, --interactive  Interactive mode with pattern selection
  -u, --update       Update existing .gitignore instead of overwriting
  -d, --dry-run      Show suggestions without writing files
  -p, --path <path>  Path to git repository (default: current directory)
  -h, --help         Display help
  -V, --version      Display version
```

## Use Cases

- **New projects**: Quickly create comprehensive .gitignore files
- **Forgotten patterns**: Detect files that should have been ignored
- **Code review**: Ensure proper git hygiene before commits
- **Template augmentation**: Enhance existing .gitignore with project-specific patterns

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

sulthonzh