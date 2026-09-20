'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createCli,
  formatDuration,
  inspectElectron,
  REQUIRED_NODE_VERSION
} = require('./cong-app-legacy');

function captureStream() {
  let value = '';
  return {
    write: function (chunk) {
      value += chunk;
    },
    value: function () {
      return value;
    }
  };
}

function createHarness(overrides) {
  const calls = [];
  const stdout = captureStream();
  const stderr = captureStream();
  let electronChecks = 0;
  const dependencies = Object.assign({
    repoRoot: '/repo',
    env: {},
    nodeVersion: REQUIRED_NODE_VERSION,
    nodeArch: 'x64',
    stdout: stdout,
    stderr: stderr,
    now: function () { return 1000; },
    angularAvailable: function () { return true; },
    chromeAvailable: function () { return true; },
    inspectElectron: function () {
      electronChecks += 1;
      return { ok: true, executablePath: '/repo/node_modules/electron/dist/Electron.app' };
    },
    runSync: function (command, args, options) {
      calls.push({ command: command, args: args, options: options });
      return { status: 0 };
    }
  }, overrides || {});

  return {
    cli: createCli(dependencies),
    calls: calls,
    stdout: stdout,
    stderr: stderr,
    electronChecks: function () { return electronChecks; }
  };
}

function createFakeProcess() {
  const child = new EventEmitter();
  child.exitCode = null;
  child.killed = false;
  child.killedWith = [];
  child.kill = function (signal) {
    child.killed = true;
    child.killedWith.push(signal);
    return true;
  };
  return child;
}

function waitUntil(predicate) {
  return new Promise(function (resolve, reject) {
    let attempts = 0;
    function check() {
      attempts += 1;
      if (predicate()) {
        resolve();
        return;
      }
      if (attempts > 50) {
        reject(new Error('Timed out waiting for test condition'));
        return;
      }
      setImmediate(check);
    }
    check();
  });
}

async function testStartRepairsElectronBeforeAngularBuild() {
  let inspection = 0;
  const harness = createHarness({
    inspectElectron: function () {
      inspection += 1;
      if (inspection === 1) {
        return { ok: false, reason: 'Electron executable is missing' };
      }
      return { ok: true, executablePath: '/repo/node_modules/electron/dist/Electron.app' };
    }
  });

  const exitCode = await harness.cli.run(['start']);

  assert.strictEqual(exitCode, 0);
  assert.deepStrictEqual(harness.calls.map(function (call) {
    return [call.command].concat(call.args);
  }), [
    ['npm', 'rebuild', 'electron'],
    [path.join('/repo', 'node_modules', '.bin', 'ng'), 'build', '--base-href', './'],
    ['/repo/node_modules/electron/dist/Electron.app', '.']
  ]);
  assert(/Repairing Electron installation once/.test(harness.stdout.value()));
}

async function testStartNeverBuildsWhenRepairFails() {
  const harness = createHarness({
    inspectElectron: function () {
      return { ok: false, reason: 'Electron executable is missing' };
    }
  });

  const exitCode = await harness.cli.run(['start']);

  assert.strictEqual(exitCode, 1);
  assert.strictEqual(harness.calls.length, 1);
  assert.deepStrictEqual(harness.calls[0].args, ['rebuild', 'electron']);
  assert(/cong-app-legacy setup/.test(harness.stderr.value()));
}

async function testDoctorIsReadOnlyAndReportsRemedies() {
  const harness = createHarness({
    nodeArch: 'arm64',
    angularAvailable: function () { return false; },
    chromeAvailable: function () { return false; },
    inspectElectron: function () {
      return { ok: false, reason: 'Electron executable is missing' };
    }
  });

  const exitCode = await harness.cli.run(['doctor']);

  assert.strictEqual(exitCode, 1);
  assert.strictEqual(harness.calls.length, 0);
  assert(/Node architecture.*arm64.*expected x64/.test(harness.stdout.value()));
  assert(/Angular CLI.*cong-app-legacy setup/.test(harness.stdout.value()));
  assert(/Electron.*npm rebuild electron/.test(harness.stdout.value()));
  assert(/warning.*Chrome/.test(harness.stdout.value()));
}

async function testSetupVerifiesFreshInstall() {
  const harness = createHarness();

  const exitCode = await harness.cli.run(['setup']);

  assert.strictEqual(exitCode, 0);
  assert.deepStrictEqual(harness.calls.map(function (call) {
    return [call.command].concat(call.args);
  }), [['npm', 'ci']]);
  assert.strictEqual(harness.electronChecks(), 1);
}

async function testChildProcessesDisableNpmUpdateNotifier() {
  const harness = createHarness();

  await harness.cli.run(['lint']);

  assert.strictEqual(harness.calls[0].options.env.NO_UPDATE_NOTIFIER, '1');
}

async function testLegacyTestCommandRunsOnceInChromeHeadless() {
  const harness = createHarness();

  const exitCode = await harness.cli.run(['test']);

  assert.strictEqual(exitCode, 0);
  assert.deepStrictEqual(harness.calls.map(function (call) {
    return [call.command].concat(call.args);
  }), [['npm', 'test', '--', '--watch=false', '--browsers=ChromeHeadless']]);
}

async function testElectronBuildAndPackagingKeepRelativeProductionBuild() {
  const harness = createHarness();

  assert.strictEqual(await harness.cli.run(['build-electron']), 0);
  assert.deepStrictEqual(harness.calls.map(function (call) {
    return [call.command].concat(call.args);
  }), [[
    path.join('/repo', 'node_modules', '.bin', 'ng'),
    'build',
    '--base-href',
    './',
    '--prod'
  ]]);

  harness.calls.length = 0;
  assert.strictEqual(await harness.cli.run(['package-mac']), 0);
  assert.deepStrictEqual(harness.calls.map(function (call) {
    return [call.command].concat(call.args);
  }), [
    [path.join('/repo', 'node_modules', '.bin', 'ng'), 'build', '--base-href', './', '--prod'],
    ['npm', 'run', 'package-mac']
  ]);
}

async function testDevFailsBeforeSpawningWhenPortIsBusy() {
  let spawnCount = 0;
  const harness = createHarness({
    isPortAvailable: function () { return Promise.resolve(false); },
    spawn: function () {
      spawnCount += 1;
    }
  });

  const exitCode = await harness.cli.run(['dev']);

  assert.strictEqual(exitCode, 1);
  assert.strictEqual(spawnCount, 0);
  assert(/127\.0\.0\.1:4211 is already in use/.test(harness.stderr.value()));
}

async function testDevWaitsForAngularThenCouplesProcessCleanup() {
  const spawned = [];
  const server = createFakeProcess();
  const electron = createFakeProcess();
  const processRef = new EventEmitter();
  const harness = createHarness({
    processRef: processRef,
    isPortAvailable: function () { return Promise.resolve(true); },
    waitForHttp: function (target, timeoutMs) {
      assert.strictEqual(target, 'http://127.0.0.1:4211/');
      assert.strictEqual(timeoutMs, 120000);
      return Promise.resolve();
    },
    spawn: function (command, args, options) {
      spawned.push({ command: command, args: args, options: options });
      return spawned.length === 1 ? server : electron;
    }
  });

  const resultPromise = harness.cli.run(['dev']);
  await waitUntil(function () { return spawned.length === 2; });

  assert.deepStrictEqual(spawned[0].args, [
    'serve', '--host', '127.0.0.1', '--port', '4211', '--open=false', '--progress=false'
  ]);
  assert.strictEqual(
    spawned[1].options.env.CONG_APP_DEV_SERVER_URL,
    'http://127.0.0.1:4211/'
  );
  electron.emit('exit', 0, null);

  assert.strictEqual(await resultPromise, 0);
  assert.deepStrictEqual(server.killedWith, ['SIGTERM']);
}

async function testDevTreatsAngularExitAsFailureAndStopsElectron() {
  const spawned = [];
  const server = createFakeProcess();
  const electron = createFakeProcess();
  const harness = createHarness({
    processRef: new EventEmitter(),
    isPortAvailable: function () { return Promise.resolve(true); },
    waitForHttp: function () { return Promise.resolve(); },
    spawn: function () {
      const child = spawned.length === 0 ? server : electron;
      spawned.push(child);
      return child;
    }
  });

  const resultPromise = harness.cli.run(['dev']);
  await waitUntil(function () { return spawned.length === 2; });
  server.emit('exit', 0, null);

  assert.strictEqual(await resultPromise, 1);
  assert.deepStrictEqual(electron.killedWith, ['SIGTERM']);
}

async function testDevStopsServerWhenReadinessFails() {
  const spawned = [];
  const server = createFakeProcess();
  const harness = createHarness({
    processRef: new EventEmitter(),
    isPortAvailable: function () { return Promise.resolve(true); },
    waitForHttp: function () { return Promise.reject(new Error('readiness timeout')); },
    spawn: function () {
      spawned.push(server);
      return server;
    }
  });

  const exitCode = await harness.cli.run(['dev']);

  assert.strictEqual(exitCode, 1);
  assert.strictEqual(spawned.length, 1);
  assert.deepStrictEqual(server.killedWith, ['SIGTERM']);
  assert(/readiness timeout/.test(harness.stderr.value()));
}

async function testDevPreservesInterruptExitCodeWhenServerExitsFirst() {
  const spawned = [];
  const server = createFakeProcess();
  const electron = createFakeProcess();
  const harness = createHarness({
    processRef: new EventEmitter(),
    isPortAvailable: function () { return Promise.resolve(true); },
    waitForHttp: function () { return Promise.resolve(); },
    spawn: function () {
      const child = spawned.length === 0 ? server : electron;
      spawned.push(child);
      return child;
    }
  });

  const resultPromise = harness.cli.run(['dev']);
  await waitUntil(function () { return spawned.length === 2; });
  server.emit('exit', null, 'SIGINT');

  assert.strictEqual(await resultPromise, 130);
  assert.deepStrictEqual(electron.killedWith, ['SIGTERM']);
}

async function testDevHandlesInterruptDuringAngularReadiness() {
  const server = createFakeProcess();
  const processRef = new EventEmitter();
  let spawnCount = 0;
  const harness = createHarness({
    processRef: processRef,
    isPortAvailable: function () { return Promise.resolve(true); },
    waitForHttp: function () { return new Promise(function () {}); },
    spawn: function () {
      spawnCount += 1;
      return server;
    }
  });

  const resultPromise = harness.cli.run(['dev']);
  await waitUntil(function () { return spawnCount === 1; });

  assert.strictEqual(processRef.listenerCount('SIGINT'), 1);
  processRef.emit('SIGINT');
  assert.strictEqual(await resultPromise, 130);
  assert.deepStrictEqual(server.killedWith, ['SIGTERM']);
  assert.strictEqual(spawnCount, 1);
}

async function testDevCancelsHttpPollingWhenAngularExitsEarly() {
  const server = createFakeProcess();
  let cancelled = 0;
  let spawnCount = 0;
  const harness = createHarness({
    processRef: new EventEmitter(),
    isPortAvailable: function () { return Promise.resolve(true); },
    waitForHttp: function () {
      return {
        promise: new Promise(function () {}),
        cancel: function () { cancelled += 1; }
      };
    },
    spawn: function () {
      spawnCount += 1;
      return server;
    }
  });

  const resultPromise = harness.cli.run(['dev']);
  await waitUntil(function () { return spawnCount === 1; });
  server.emit('exit', 1, null);

  assert.strictEqual(await resultPromise, 1);
  assert.strictEqual(cancelled, 1);
  assert.strictEqual(spawnCount, 1);
}

async function testShellKeepsThePinnedRuntimeIsolated() {
  const harness = createHarness({
    env: { SHELL: '/bin/zsh' }
  });

  const exitCode = await harness.cli.run(['shell']);

  assert.strictEqual(exitCode, 0);
  assert.strictEqual(harness.calls[0].command, '/bin/bash');
  assert.deepStrictEqual(harness.calls[0].args, ['--noprofile', '--norc', '-i']);
  assert(/cong-app Node 12\.22\.12 x64/.test(harness.calls[0].options.env.PS1));
}

function testDurationFormatting() {
  assert.strictEqual(formatDuration(0), '0.00s');
  assert.strictEqual(formatDuration(1250), '1.25s');
}

function testElectronInspectionRejectsNonExecutableBinary() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cong-electron-check-'));
  const moduleRoot = path.join(fixtureRoot, 'node_modules');
  const electronRoot = path.join(moduleRoot, 'electron');
  const executablePath = path.join(electronRoot, 'Electron');
  fs.mkdirSync(moduleRoot);
  fs.mkdirSync(electronRoot);
  fs.writeFileSync(
    path.join(electronRoot, 'index.js'),
    'module.exports = ' + JSON.stringify(executablePath) + ';\n'
  );
  fs.writeFileSync(executablePath, 'not executable\n', { mode: 0o644 });

  try {
    const result = inspectElectron(fixtureRoot);
    assert.strictEqual(result.ok, false);
    assert(/not executable/.test(result.reason));
  } finally {
    fs.unlinkSync(path.join(electronRoot, 'index.js'));
    fs.unlinkSync(executablePath);
    fs.rmdirSync(electronRoot);
    fs.rmdirSync(moduleRoot);
    fs.rmdirSync(fixtureRoot);
  }
}

async function run() {
  const tests = [
    testStartRepairsElectronBeforeAngularBuild,
    testStartNeverBuildsWhenRepairFails,
    testDoctorIsReadOnlyAndReportsRemedies,
    testSetupVerifiesFreshInstall,
    testChildProcessesDisableNpmUpdateNotifier,
    testLegacyTestCommandRunsOnceInChromeHeadless,
    testElectronBuildAndPackagingKeepRelativeProductionBuild,
    testDevFailsBeforeSpawningWhenPortIsBusy,
    testDevWaitsForAngularThenCouplesProcessCleanup,
    testDevTreatsAngularExitAsFailureAndStopsElectron,
    testDevStopsServerWhenReadinessFails,
    testDevPreservesInterruptExitCodeWhenServerExitsFirst,
    testDevHandlesInterruptDuringAngularReadiness,
    testDevCancelsHttpPollingWhenAngularExitsEarly,
    testShellKeepsThePinnedRuntimeIsolated,
    testDurationFormatting,
    testElectronInspectionRejectsNonExecutableBinary
  ];

  for (let index = 0; index < tests.length; index += 1) {
    await tests[index]();
    process.stdout.write('ok - ' + tests[index].name + '\n');
  }
}

run().catch(function (error) {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
});
