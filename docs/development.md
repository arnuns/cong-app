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

`doctor` is read-only and checks the repository, pinned Node runtime, Angular CLI, Electron x64 executable, and Chrome. `setup` selects Node 12.22.12 through NVM and downloads it if missing. It runs `npm ci` from the lockfile and verifies Angular and Electron. Dependency installation can require network access to the npm registry and Electron download host, even when Node is installed. Run `setup` for initial setup or when dependencies change.

The bootstrap rejects any runtime other than Node `v12.22.12` with architecture `x64`. Each command reports its elapsed time and suppresses the npm update notifier.

## Daily commands

| Command | Result / caution |
| --- | --- |
| `cong-app-legacy doctor` | checks the runtime and dependencies without changing them |
| `cong-app-legacy start` | checks Electron, attempts one `npm rebuild electron` when needed, then builds and launches Electron |
| `cong-app-legacy dev` | starts Angular live reload on `127.0.0.1:4211`, waits for HTTP 200, then launches Electron |
| `cong-app-legacy test` | checks local bind permission and runs Karma once with ChromeHeadless |
| `cong-app-legacy lint` | runs TSLint and Codelyzer |
| `cong-app-legacy build-web` | creates the production web build in `dist/`; does not package or publish |
| `cong-app-legacy build-electron` | creates a production build with a relative base URL in `dist/`; does not publish |
| `cong-app-legacy package-mac` | builds and packages an unsigned Intel macOS application; not a universal or arm64 build |
| `cong-app-legacy shell` | opens Bash with the pinned x64 Node runtime; use `exit` to leave |
| `cong-app-legacy deploy` | **builds and publishes a Windows installer as a real GitHub release** |

Use `npm run build` in the legacy shell to check the Windows installer locally. The direct `deploy` command can upload a real GitHub release and requires explicit release authorization and a securely provided `GH_TOKEN` or `GITHUB_TOKEN`. Use the [Windows release flow](#windows-release) to inspect the installer and draft assets before publishing.

`build-web` and `build-electron` share `dist/`; do not run them concurrently. The project's `npm run build` creates a Windows installer and is not the web-build verification command.

### Live Electron development and focused commands

Use `cong-app-legacy dev` for normal UI work. It keeps Angular source maps enabled, rebuilds changed files through the development server, and points every Electron window at the same loopback URL. Closing Electron or pressing Ctrl-C also stops the Angular server. The command refuses to start when port 4211 is occupied, so it never kills an unrelated process.

Use `cong-app-legacy start` when validating the packaged `file://` behavior. It performs a complete Angular build before launching Electron and remains the fallback when a workflow behaves differently outside the development server.

The current CLI does not forward extra arguments to subcommands. For example, `cong-app-legacy test --include=...` does not apply the expected filter. Enter the legacy shell and invoke project commands directly:

```sh
cong-app-legacy shell
npm start
```

The direct web development server uses `angular.json` and currently listens on port 4211. It does not launch Electron or provide the CLI's coupled cleanup.

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

## Windows release

1. Set the version in `package.json` and both root version fields in `package-lock.json`. Set `releaseDate` in the dev and production environments in `DD/MM/YYYY` format. Include the release metadata in the reviewed PR to `master`.
2. Use `gh pr view <number> --repo arnuns/cong-app --json state,reviewDecision,mergeStateStatus,mergeCommit` to check review and merge status. After merge, fetch `origin/master` and verify the reported merge SHA is on it with `git merge-base --is-ancestor "$release_sha" origin/master`.
3. Export that SHA to a temporary directory. Build with the bootstrap inside the export so the build uses the reviewed source and dependencies from its lockfile. In the following commands, set `release_sha` to the merge SHA checked in step 2.

   ```sh
   release_src=$(mktemp -d)
   git archive "$release_sha" | tar -x -C "$release_src"
   CONG_APP_REPO_PATH="$release_src" "$release_src/scripts/cong-app-legacy-bootstrap" setup
   CONG_APP_REPO_PATH="$release_src" "$release_src/scripts/cong-app-legacy-bootstrap" shell
   ```

   In the exported checkout's shell, run `npm run build` and `npm run verify:electron-release`, then `exit`. The verifier checks the packaged runtime, rejects checkout `.env` and old packaging files, and checks the installer against `release/latest.yml`.

4. Use the authenticated GitHub CLI to publish after release authorization. Confirm the proposed `vX.Y.Z` tag and release name are unused on GitHub, tag the verified SHA, and push that tag. Stage copies of the installer and blockmap using the GitHub-safe names `Cong-Application-Setup-X.Y.Z.exe` and `Cong-Application-Setup-X.Y.Z.exe.blockmap`, plus `latest.yml`. Upload the three files from the staging directory with `gh release create vX.Y.Z --repo arnuns/cong-app --verify-tag --draft --notes-file <notes> Cong-Application-Setup-X.Y.Z.exe Cong-Application-Setup-X.Y.Z.exe.blockmap latest.yml`.
5. Compare the three draft assets with local `shasum -a 256` results. `gh api --method GET 'repos/arnuns/cong-app/releases?per_page=10'` lists the draft with each asset's name, size, state, and `sha256:` digest. When the assets match, publish with `gh release edit vX.Y.Z --repo arnuns/cong-app --verify-tag --draft=false --prerelease=false --latest`. Confirm `gh api --method GET repos/arnuns/cong-app/releases/latest` reports the correct tag and all three assets.

## Troubleshooting

- **command not found:** verify that the CLI exists, is executable, and its directory is in `PATH`.
- **repository or NVM not found:** check `REPO_PATH` and `NVM_SCRIPT` in the CLI; do not move the repository as a workaround unless required.
- **Node is not installed / dependencies are not installed:** run `cong-app-legacy setup`.
- **Electron failed to install correctly:** retry `cong-app-legacy start`; it attempts one visible `npm rebuild electron` before any Angular build. If the repair still fails, run `cong-app-legacy setup`.
- **Port 4211 is already in use:** stop the existing development session or continue using it. The CLI reports the conflict and leaves the existing process untouched.
- **Angular dev server never becomes ready:** inspect the Angular output above the timeout message. Electron launches only after `http://127.0.0.1:4211/` returns HTTP 200.
- **expected x64 / Bad CPU type:** verify Rosetta 2 and the x64 Node installation; do not silently substitute arm64 Node.
- **ChromeHeadless launch failed:** verify Google Chrome installation and launch permission; this is not a passing test result.
- If Karma cannot listen on a local port, run `cong-app-legacy test` with local port binding and Chrome launch permitted. The wrapper exits before Angular starts when binding is denied. Karma's ping and inactivity timeouts are both 120 seconds to allow the suite to start on the legacy runtime.
- **Unknown option:** run `./node_modules/.bin/ng test --help` inside the legacy shell; the old CLI may not support current Angular options.
- **Template/provider test errors:** fix test-module imports/providers and separate baseline failures from regressions; do not skip the tests.
- **Sandbox blocks writes or ports:** request permission only for the required test/build command rather than disabling machine-wide restrictions.

## Scope

This guide documents the versioned CLI core and its external path launcher. It does not install the launcher, change machine configuration, or run deployment automatically.

See [AGENTS.md](../AGENTS.md) for additional repository instructions.
