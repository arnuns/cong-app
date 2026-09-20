# Development with `cong-app-legacy`

This guide covers the legacy CONG Angular 8 / Electron application. Use the CLI that pins Node **12.22.12 x64** rather than the machine's current Node runtime.

## Prerequisites

- macOS and Bash; Apple Silicon requires Rosetta 2 for x64 execution
- Git and NVM
- Google Chrome for `ChromeHeadless`
- a `cong-app` checkout and a small `cong-app-legacy` launcher in your `PATH`

This Node version is required for compatibility with the legacy project and is not a recommendation for new projects. Do not change Node or upgrade dependencies during unrelated work without separate verification.

## Installing the CLI on a new machine

The CLI implementation is versioned in this repository. The machine-level launcher only supplies the checkout and NVM paths, so fixes to the CLI are reviewed with the application. It is not available through `npm install -g cong-app-legacy`.

1. Create `$HOME/.local/bin` if necessary.
2. Save the launcher below as `$HOME/.local/bin/cong-app-legacy`, replacing the two paths for the local machine.
3. Make it executable with `chmod +x "$HOME/.local/bin/cong-app-legacy"` and add `$HOME/.local/bin` to the shell `PATH`.
4. Verify `command -v cong-app-legacy`, `cong-app-legacy help`, and `cong-app-legacy doctor` before running `setup`.

```bash
#!/usr/bin/env bash
set -euo pipefail

export CONG_APP_REPO_PATH="/path/to/cong-app"
export CONG_APP_NVM_SCRIPT="$HOME/.nvm/nvm.sh"
exec "$CONG_APP_REPO_PATH/scripts/cong-app-legacy-bootstrap" "$@"
```

The CLI inspected for this guide points to:

- checkout: `/Users/arnunsae/codes/ubk/cong-app`
- NVM: `/Users/arnunsae/.nvm/nvm.sh`
- launcher: `/Users/arnunsae/.local/bin/cong-app-legacy`

These paths belong to one machine and are not portable defaults. The CLI always changes to `REPO_PATH`, even when invoked from another directory or worktree. Confirm that it targets the checkout you intend to test.

## Getting started

```sh
cong-app-legacy help
cong-app-legacy doctor
cong-app-legacy setup
cong-app-legacy start
```

`doctor` is read-only and checks the repository, pinned Node runtime, Angular CLI, Electron x64 executable, and Chrome. `setup` installs/selects Node 12.22.12 through NVM, runs `npm ci` from the lockfile, and verifies Angular and Electron. It requires network access and reinstalls dependencies in `node_modules`, including package install scripts. Review the repository and lockfile before running it. Run `setup` only for initial setup or when dependencies change.

The bootstrap rejects any runtime other than Node `v12.22.12` with architecture `x64`. Each command reports its elapsed time and suppresses the npm update notifier.

## Daily commands

| Command | Result / caution |
| --- | --- |
| `cong-app-legacy doctor` | checks the runtime and dependencies without changing them |
| `cong-app-legacy start` | checks Electron, attempts one `npm rebuild electron` when needed, then builds and launches Electron |
| `cong-app-legacy test` | runs Karma once with ChromeHeadless |
| `cong-app-legacy lint` | runs TSLint and Codelyzer |
| `cong-app-legacy build-web` | creates the production web build in `dist/`; does not package or publish |
| `cong-app-legacy build-electron` | creates a production build with a relative base URL in `dist/`; does not publish |
| `cong-app-legacy package-mac` | builds and packages an unsigned Intel macOS application; not a universal or arm64 build |
| `cong-app-legacy shell` | opens Bash with the pinned x64 Node runtime; use `exit` to leave |
| `cong-app-legacy deploy` | **builds and publishes a Windows installer as a real GitHub release** |

Never use `deploy` merely to check whether a build passes. It requires explicit release authorization and a securely provided `GH_TOKEN` or `GITHUB_TOKEN`. Never place a token in the repository, documentation, command history, or screenshots.

`build-web` and `build-electron` share `dist/`; do not run them concurrently. The project's `npm run build` creates a Windows installer and is not the web-build verification command.

### Web development server and focused commands

The current CLI does not forward extra arguments to subcommands. For example, `cong-app-legacy test --include=...` does not apply the expected filter. Enter the legacy shell and invoke project commands directly:

```sh
cong-app-legacy shell
npm start
```

The web development server uses `angular.json` and currently listens on port 4211.

Run a focused test inside the shell, for example:

```sh
npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/modules/payroll/pages/salary/salary-compensation.component.spec.ts
```

Always run the full suite with `cong-app-legacy test` before submitting a PR. A focused result is not a whole-project result.

## Before opening a PR

1. Run `cong-app-legacy lint`.
2. Run `cong-app-legacy test`.
3. Run `cong-app-legacy build-web` after UI or TypeScript changes.
4. Inspect changed screens and print layout, and run E2E coverage when changing a workflow.
5. Check the diff for unintended `dist/`, `release/`, `node_modules/`, secrets, or environment files.

Record the exact commands and outcomes. If the baseline has failures, list their names and causes separately from new work. Never claim the full test suite passes based on filtered tests.

## Troubleshooting

- **command not found:** verify that the CLI exists, is executable, and its directory is in `PATH`.
- **repository or NVM not found:** check `REPO_PATH` and `NVM_SCRIPT` in the CLI; do not move the repository as a workaround unless required.
- **Node is not installed / dependencies are not installed:** run `cong-app-legacy setup`.
- **Electron failed to install correctly:** retry `cong-app-legacy start`; it attempts one visible `npm rebuild electron` before any Angular build. If the repair still fails, run `cong-app-legacy setup`.
- **expected x64 / Bad CPU type:** verify Rosetta 2 and the x64 Node installation; do not silently substitute arm64 Node.
- **ChromeHeadless launch failed:** verify Google Chrome installation and launch permission; this is not a passing test result.
- **Unknown option:** run `./node_modules/.bin/ng test --help` inside the legacy shell; the old CLI may not support current Angular options.
- **Template/provider test errors:** fix test-module imports/providers and separate baseline failures from regressions; do not skip the tests.
- **Sandbox blocks writes or ports:** request permission only for the required test/build command rather than disabling machine-wide restrictions.

## Scope

This guide documents the versioned CLI core and its external path launcher. It does not install the launcher, change machine configuration, or run deployment automatically.

See [AGENTS.md](../AGENTS.md) for additional repository instructions.
