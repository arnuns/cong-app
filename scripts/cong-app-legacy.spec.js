'use strict';

const assert = require('assert');
const path = require('path');

const {
  createCli,
  formatDuration,
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

function testDurationFormatting() {
  assert.strictEqual(formatDuration(0), '0.00s');
  assert.strictEqual(formatDuration(1250), '1.25s');
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
    testDurationFormatting
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
