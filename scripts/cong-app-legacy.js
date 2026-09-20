#!/usr/bin/env node
'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const REQUIRED_NODE_VERSION = 'v12.22.12';
const REQUIRED_NODE_ARCH = 'x64';

function formatDuration(milliseconds) {
  return (milliseconds / 1000).toFixed(2) + 's';
}

function inspectElectron(repoRoot) {
  const electronModule = path.join(repoRoot, 'node_modules', 'electron');
  let executablePath;

  try {
    executablePath = require(electronModule);
  } catch (error) {
    return {
      ok: false,
      reason: error && error.message ? error.message : 'Electron could not be loaded'
    };
  }

  if (!executablePath || !fs.existsSync(executablePath)) {
    return { ok: false, reason: 'Electron executable is missing' };
  }

  const fileResult = childProcess.spawnSync('/usr/bin/file', [executablePath], {
    encoding: 'utf8'
  });
  if (fileResult.status !== 0) {
    return { ok: false, reason: 'Electron executable architecture could not be inspected' };
  }

  if (fileResult.stdout.indexOf('x86_64') === -1) {
    return { ok: false, reason: 'Electron executable is not x86_64' };
  }

  return { ok: true, executablePath: executablePath };
}

function defaultAngularAvailable(repoRoot) {
  const angularPath = path.join(repoRoot, 'node_modules', '.bin', 'ng');
  try {
    fs.accessSync(angularPath, fs.constants.X_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function defaultChromeAvailable() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  return candidates.some(function (candidate) {
    return fs.existsSync(candidate);
  });
}

function createCli(overrides) {
  const supplied = overrides || {};
  const dependencies = {
    repoRoot: supplied.repoRoot || path.resolve(__dirname, '..'),
    env: supplied.env || process.env,
    nodeVersion: supplied.nodeVersion || process.version,
    nodeArch: supplied.nodeArch || process.arch,
    stdout: supplied.stdout || process.stdout,
    stderr: supplied.stderr || process.stderr,
    now: supplied.now || Date.now,
    angularAvailable: supplied.angularAvailable || defaultAngularAvailable,
    chromeAvailable: supplied.chromeAvailable || defaultChromeAvailable,
    inspectElectron: supplied.inspectElectron || inspectElectron,
    runSync: supplied.runSync || childProcess.spawnSync
  };

  function write(stream, message) {
    stream.write(message + '\n');
  }

  function runChild(command, args, options) {
    const childOptions = Object.assign({
      cwd: dependencies.repoRoot,
      stdio: 'inherit'
    }, options || {});
    childOptions.env = Object.assign({}, dependencies.env, {
      NO_UPDATE_NOTIFIER: '1'
    }, childOptions.env || {});
    return dependencies.runSync(command, args, childOptions);
  }

  function requireSuccessful(result, description) {
    if (result && result.status === 0) {
      return;
    }
    const signal = result && result.signal ? ' (signal ' + result.signal + ')' : '';
    throw new Error(description + ' failed' + signal + '.');
  }

  function verifyRuntime() {
    if (dependencies.nodeVersion !== REQUIRED_NODE_VERSION) {
      throw new Error(
        'Node ' + REQUIRED_NODE_VERSION + ' is required; found ' + dependencies.nodeVersion +
        '. Run cong-app-legacy setup.'
      );
    }
    if (dependencies.nodeArch !== REQUIRED_NODE_ARCH) {
      throw new Error(
        'Node architecture ' + REQUIRED_NODE_ARCH + ' is required; found ' + dependencies.nodeArch +
        '. Run cong-app-legacy setup.'
      );
    }
  }

  function verifyAngular() {
    if (!dependencies.angularAvailable(dependencies.repoRoot)) {
      throw new Error('Angular CLI is missing. Run cong-app-legacy setup.');
    }
  }

  function getElectronHealth() {
    return dependencies.inspectElectron(dependencies.repoRoot);
  }

  function verifyElectron() {
    const health = getElectronHealth();
    if (!health.ok) {
      throw new Error(
        'Electron is not ready: ' + health.reason + '. Run npm rebuild electron or cong-app-legacy setup.'
      );
    }
    return health;
  }

  function ensureElectron() {
    let health = getElectronHealth();
    if (health.ok) {
      return health;
    }

    write(
      dependencies.stdout,
      'Electron check failed: ' + health.reason + '. Repairing Electron installation once...'
    );
    const repairResult = runChild('npm', ['rebuild', 'electron']);
    if (!repairResult || repairResult.status !== 0) {
      throw new Error(
        'Electron repair failed. Run cong-app-legacy setup, then retry the command.'
      );
    }

    health = getElectronHealth();
    if (!health.ok) {
      throw new Error(
        'Electron is still unavailable after one repair: ' + health.reason +
        '. Run cong-app-legacy setup, then retry the command.'
      );
    }
    write(dependencies.stdout, 'Electron repair completed.');
    return health;
  }

  function runDoctor() {
    let healthy = true;
    const repoPackage = path.join(dependencies.repoRoot, 'package.json');

    if (fs.existsSync(repoPackage)) {
      write(dependencies.stdout, '[ok] Repository: ' + dependencies.repoRoot);
    } else {
      healthy = false;
      write(dependencies.stdout, '[error] Repository: package.json is missing at ' + dependencies.repoRoot);
    }

    if (dependencies.nodeVersion === REQUIRED_NODE_VERSION) {
      write(dependencies.stdout, '[ok] Node version: ' + dependencies.nodeVersion);
    } else {
      healthy = false;
      write(
        dependencies.stdout,
        '[error] Node version: ' + dependencies.nodeVersion + ' (expected ' + REQUIRED_NODE_VERSION +
        '; run cong-app-legacy setup)'
      );
    }

    if (dependencies.nodeArch === REQUIRED_NODE_ARCH) {
      write(dependencies.stdout, '[ok] Node architecture: ' + dependencies.nodeArch);
    } else {
      healthy = false;
      write(
        dependencies.stdout,
        '[error] Node architecture: ' + dependencies.nodeArch + ' (expected ' + REQUIRED_NODE_ARCH +
        '; run cong-app-legacy setup)'
      );
    }

    if (dependencies.angularAvailable(dependencies.repoRoot)) {
      write(dependencies.stdout, '[ok] Angular CLI: installed');
    } else {
      healthy = false;
      write(dependencies.stdout, '[error] Angular CLI: missing; run cong-app-legacy setup');
    }

    const electronHealth = getElectronHealth();
    if (electronHealth.ok) {
      write(dependencies.stdout, '[ok] Electron: x86_64 executable available');
    } else {
      healthy = false;
      write(
        dependencies.stdout,
        '[error] Electron: ' + electronHealth.reason + '; run npm rebuild electron or cong-app-legacy setup'
      );
    }

    if (dependencies.chromeAvailable()) {
      write(dependencies.stdout, '[ok] Chrome: available for Karma tests');
    } else {
      write(dependencies.stdout, '[warning] Chrome: not found; npm test may not be able to launch Karma');
    }

    return healthy ? 0 : 1;
  }

  function runSetup() {
    verifyRuntime();
    requireSuccessful(runChild('npm', ['ci']), 'npm ci');
    verifyAngular();
    verifyElectron();
    write(dependencies.stdout, 'Dependencies installed and verified.');
    return 0;
  }

  function runStart() {
    verifyRuntime();
    verifyAngular();
    const electronHealth = ensureElectron();
    const angularPath = path.join(dependencies.repoRoot, 'node_modules', '.bin', 'ng');
    requireSuccessful(
      runChild(angularPath, ['build', '--base-href', './']),
      'Angular desktop build'
    );
    requireSuccessful(runChild(electronHealth.executablePath, ['.']), 'Electron');
    return 0;
  }

  function runNpmScript(scriptName, needsElectron) {
    verifyRuntime();
    verifyAngular();
    if (needsElectron) {
      ensureElectron();
    }
    requireSuccessful(runChild('npm', ['run', scriptName]), 'npm run ' + scriptName);
    return 0;
  }

  function runProductionElectronBuild() {
    verifyRuntime();
    verifyAngular();
    const angularPath = path.join(dependencies.repoRoot, 'node_modules', '.bin', 'ng');
    requireSuccessful(
      runChild(angularPath, ['build', '--base-href', './', '--prod']),
      'Angular Electron production build'
    );
    return 0;
  }

  function runHelp() {
    write(dependencies.stdout, [
      'Usage: cong-app-legacy <command>',
      '',
      'Commands:',
      '  doctor          Check the pinned runtime and project dependencies',
      '  setup           Install exact dependencies and verify Electron',
      '  start           Build once and launch Electron',
      '  test            Run the Angular unit tests',
      '  lint            Run TSLint',
      '  build-web       Create the production web build',
      '  build-electron  Create the Windows Electron installer',
      '  package-mac     Create the macOS Electron package',
      '  deploy          Publish a GitHub release (requires GH_TOKEN)',
      '  shell           Open a shell with Node 12.22.12 x64 active',
      '  help            Show this help'
    ].join('\n'));
    return 0;
  }

  function runCommand(command) {
    switch (command) {
      case 'doctor':
        return runDoctor();
      case 'setup':
        return runSetup();
      case 'start':
        return runStart();
      case 'test':
        verifyRuntime();
        verifyAngular();
        requireSuccessful(
          runChild('npm', ['test', '--', '--watch=false', '--browsers=ChromeHeadless']),
          'Karma tests'
        );
        return 0;
      case 'lint':
        return runNpmScript('lint', false);
      case 'build-web':
        verifyRuntime();
        verifyAngular();
        requireSuccessful(
          runChild(path.join(dependencies.repoRoot, 'node_modules', '.bin', 'ng'), ['build', '--prod']),
          'Angular production build'
        );
        return 0;
      case 'build-electron':
        return runProductionElectronBuild();
      case 'package-mac':
        ensureElectron();
        runProductionElectronBuild();
        requireSuccessful(runChild('npm', ['run', 'package-mac']), 'npm run package-mac');
        return 0;
      case 'deploy':
        if (!dependencies.env.GH_TOKEN && !dependencies.env.GITHUB_TOKEN) {
          throw new Error('GH_TOKEN or GITHUB_TOKEN is required for deploy.');
        }
        return runNpmScript('deploy', true);
      case 'shell':
        verifyRuntime();
        requireSuccessful(
          runChild(dependencies.env.SHELL || '/bin/bash', [], { stdio: 'inherit' }),
          'Shell'
        );
        return 0;
      case 'help':
      case '--help':
      case '-h':
      case undefined:
        return runHelp();
      default:
        throw new Error('Unknown command: ' + command + '. Run cong-app-legacy help.');
    }
  }

  async function run(argv) {
    const startedAt = dependencies.now();
    const command = argv[0];
    try {
      const exitCode = await Promise.resolve(runCommand(command));
      if (command && command !== 'help' && command !== '--help' && command !== '-h') {
        write(
          dependencies.stdout,
          'cong-app-legacy ' + command + ' finished in ' + formatDuration(dependencies.now() - startedAt) + '.'
        );
      }
      return exitCode;
    } catch (error) {
      write(dependencies.stderr, 'Error: ' + error.message);
      return 1;
    }
  }

  return {
    run: run
  };
}

if (require.main === module) {
  createCli().run(process.argv.slice(2)).then(function (exitCode) {
    process.exitCode = exitCode;
  });
}

module.exports = {
  createCli: createCli,
  formatDuration: formatDuration,
  inspectElectron: inspectElectron,
  REQUIRED_NODE_VERSION: REQUIRED_NODE_VERSION
};
