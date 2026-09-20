#!/usr/bin/env node
'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');

const {
  DEV_SERVER_ENV,
  DEV_SERVER_URL
} = require('../electron-renderer-url');

const REQUIRED_NODE_VERSION = 'v12.22.12';
const REQUIRED_NODE_ARCH = 'x64';
const DEV_SERVER_HOST = '127.0.0.1';
const DEV_SERVER_PORT = 4211;
const DEV_SERVER_TIMEOUT_MS = 120000;

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

  try {
    fs.accessSync(executablePath, fs.constants.X_OK);
  } catch (error) {
    return { ok: false, reason: 'Electron executable is not executable' };
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

function defaultIsPortAvailable(host, port) {
  return new Promise(function (resolve, reject) {
    const server = net.createServer();
    server.unref();
    server.once('error', function (error) {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        resolve(false);
        return;
      }
      reject(error);
    });
    server.listen({ host: host, port: port, exclusive: true }, function () {
      server.close(function () {
        resolve(true);
      });
    });
  });
}

function defaultWaitForHttp(target, timeoutMs) {
  const startedAt = Date.now();
  let activeRequest = null;
  let retryTimer = null;
  let cancelled = false;
  const promise = new Promise(function (resolve, reject) {
    function attempt() {
      if (cancelled) {
        return;
      }
      let completed = false;
      const request = http.get(target, function (response) {
        if (activeRequest === request) {
          activeRequest = null;
        }
        if (completed || cancelled) {
          response.resume();
          return;
        }
        completed = true;
        response.resume();
        if (response.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });
      activeRequest = request;

      request.setTimeout(1000, function () {
        request.destroy();
      });
      request.on('error', function () {
        if (activeRequest === request) {
          activeRequest = null;
        }
        if (completed || cancelled) {
          return;
        }
        completed = true;
        retry();
      });
    }

    function retry() {
      if (cancelled) {
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('Angular dev server did not return HTTP 200 within 120 seconds.'));
        return;
      }
      retryTimer = setTimeout(attempt, 250);
    }

    attempt();
  });

  return {
    promise: promise,
    cancel: function () {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (activeRequest) {
        activeRequest.destroy();
        activeRequest = null;
      }
    }
  };
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
    runSync: supplied.runSync || childProcess.spawnSync,
    spawn: supplied.spawn || childProcess.spawn,
    isPortAvailable: supplied.isPortAvailable || defaultIsPortAvailable,
    waitForHttp: supplied.waitForHttp || defaultWaitForHttp,
    processRef: supplied.processRef || process
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

  function spawnChild(command, args, options) {
    const childOptions = Object.assign({
      cwd: dependencies.repoRoot,
      stdio: 'inherit'
    }, options || {});
    childOptions.env = Object.assign({}, dependencies.env, {
      NO_UPDATE_NOTIFIER: '1'
    }, childOptions.env || {});
    return dependencies.spawn(command, args, childOptions);
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

  function stopProcess(child) {
    if (child && child.exitCode === null && !child.killed) {
      child.kill('SIGTERM');
    }
  }

  function superviseDevProcesses(server, electron) {
    return new Promise(function (resolve) {
      let settled = false;

      function cleanup() {
        server.removeListener('exit', onServerExit);
        server.removeListener('error', onServerError);
        electron.removeListener('exit', onElectronExit);
        electron.removeListener('error', onElectronError);
      }

      function finish(exitCode, sibling) {
        if (settled) {
          return;
        }
        settled = true;
        stopProcess(sibling);
        cleanup();
        resolve(exitCode);
      }

      function signalExitCode(signal) {
        if (signal === 'SIGINT') {
          return 130;
        }
        if (signal === 'SIGTERM') {
          return 143;
        }
        return 1;
      }

      function onServerExit(code, signal) {
        if (signal) {
          finish(signalExitCode(signal), electron);
          return;
        }
        finish(code && code !== 0 ? code : 1, electron);
      }

      function onElectronExit(code, signal) {
        finish(signal ? signalExitCode(signal) : (typeof code === 'number' ? code : 1), server);
      }

      function onServerError() {
        finish(1, electron);
      }

      function onElectronError() {
        finish(1, server);
      }

      server.once('exit', onServerExit);
      server.once('error', onServerError);
      electron.once('exit', onElectronExit);
      electron.once('error', onElectronError);
    });
  }

  function createDevSignalController(getChildren) {
    let settled = false;
    let resolveSignal;
    const promise = new Promise(function (resolve) {
      resolveSignal = resolve;
    });

    function finish(exitCode) {
      if (settled) {
        return;
      }
      settled = true;
      getChildren().forEach(stopProcess);
      resolveSignal(exitCode);
    }

    function onSigint() {
      finish(130);
    }

    function onSigterm() {
      finish(143);
    }

    dependencies.processRef.once('SIGINT', onSigint);
    dependencies.processRef.once('SIGTERM', onSigterm);

    return {
      promise: promise,
      cleanup: function () {
        dependencies.processRef.removeListener('SIGINT', onSigint);
        dependencies.processRef.removeListener('SIGTERM', onSigterm);
      }
    };
  }

  async function waitForAngular(server, signalPromise) {
    let onExit;
    let onError;
    const waitResult = dependencies.waitForHttp(DEV_SERVER_URL, DEV_SERVER_TIMEOUT_MS);
    const readinessPromise = waitResult && waitResult.promise ? waitResult.promise : waitResult;
    const cancelReadiness = waitResult && waitResult.cancel ? waitResult.cancel : function () {};
    const earlyFailure = new Promise(function (resolve, reject) {
      onExit = function (code) {
        reject(new Error('Angular dev server exited before it became ready (code ' + code + ').'));
      };
      onError = function (error) {
        reject(new Error('Angular dev server failed to start: ' + error.message));
      };
      server.once('exit', onExit);
      server.once('error', onError);
    });
    const interruption = signalPromise.then(function (exitCode) {
      const error = new Error('Development session interrupted.');
      error.exitCode = exitCode;
      throw error;
    });

    try {
      await Promise.race([
        readinessPromise,
        earlyFailure,
        interruption
      ]);
    } finally {
      cancelReadiness();
      server.removeListener('exit', onExit);
      server.removeListener('error', onError);
    }
  }

  async function runDev() {
    verifyRuntime();
    verifyAngular();
    const electronHealth = ensureElectron();
    const portAvailable = await dependencies.isPortAvailable(DEV_SERVER_HOST, DEV_SERVER_PORT);
    if (!portAvailable) {
      throw new Error(
        DEV_SERVER_HOST + ':' + DEV_SERVER_PORT +
        ' is already in use. Stop that process or choose the existing development session.'
      );
    }

    const angularPath = path.join(dependencies.repoRoot, 'node_modules', '.bin', 'ng');
    write(dependencies.stdout, 'Starting Angular development server at ' + DEV_SERVER_URL + '...');
    const server = spawnChild(angularPath, [
      'serve',
      '--host', DEV_SERVER_HOST,
      '--port', String(DEV_SERVER_PORT),
      '--open=false',
      '--progress=false'
    ]);
    let electron = null;
    const signals = createDevSignalController(function () {
      return [server, electron];
    });

    try {
      try {
        await waitForAngular(server, signals.promise);
      } catch (error) {
        stopProcess(server);
        if (error.exitCode) {
          return error.exitCode;
        }
        throw error;
      }

      write(dependencies.stdout, 'Angular is ready. Launching Electron...');
      const electronEnvironment = {};
      electronEnvironment[DEV_SERVER_ENV] = DEV_SERVER_URL;
      electron = spawnChild(electronHealth.executablePath, ['.'], {
        env: electronEnvironment
      });
      return await Promise.race([
        superviseDevProcesses(server, electron),
        signals.promise
      ]);
    } finally {
      signals.cleanup();
    }
  }

  function runHelp() {
    write(dependencies.stdout, [
      'Usage: cong-app-legacy <command>',
      '',
      'Commands:',
      '  doctor          Check the pinned runtime and project dependencies',
      '  setup           Install exact dependencies and verify Electron',
      '  start           Build once and launch Electron',
      '  dev             Run Angular live reload with Electron',
      '  test            Run the Angular unit tests',
      '  lint            Run TSLint',
      '  build-web       Create the production web build',
      '  build-electron  Create the relative production Electron build',
      '  package-mac     Create the macOS Electron package',
      '  deploy          Publish a GitHub release (requires a GitHub token)',
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
      case 'dev':
        return runDev();
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
        verifyRuntime();
        verifyAngular();
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
          runChild('/bin/bash', ['--noprofile', '--norc', '-i'], {
            env: { PS1: '[cong-app Node 12.22.12 x64] \\W \\$ ' },
            stdio: 'inherit'
          }),
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
