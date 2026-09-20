'use strict';

const assert = require('assert');

const {
  DEV_SERVER_ENV,
  DEV_SERVER_URL,
  buildRendererUrl,
  isDevelopmentRenderer
} = require('../electron-renderer-url');
const { prepareBrowserScripts } = require('../electron-preload');

function testFileRendererUrl() {
  assert.strictEqual(
    buildRendererUrl('', {}, '/app'),
    'file:///app/dist/index.html'
  );
  assert.strictEqual(
    buildRendererUrl('/employee/detail/123', {}, '/app'),
    'file:///app/dist/index.html#/employee/detail/123'
  );
}

function testDevelopmentRendererUrlPreservesHashRoutes() {
  const environment = {};
  environment[DEV_SERVER_ENV] = DEV_SERVER_URL;

  assert.strictEqual(
    buildRendererUrl('/employee/edit/123?backUrl=/employee', environment, '/app'),
    'http://127.0.0.1:4211/#/employee/edit/123?backUrl=/employee'
  );
  assert.strictEqual(isDevelopmentRenderer(environment), true);
}

function testUnexpectedDevelopmentUrlIsRejected() {
  const environment = {};
  environment[DEV_SERVER_ENV] = 'http://localhost:4211/';

  assert.throws(function () {
    buildRendererUrl('', environment, '/app');
  }, /must be http:\/\/127\.0\.0\.1:4211\//);
}

function testElectronPreloadUsesBrowserBranchesForGlobalScripts() {
  const electronModule = { filename: 'renderer' };
  const electronExports = {};
  let domReady;
  const targetWindow = {
    module: electronModule,
    exports: electronExports,
    addEventListener: function (eventName, listener, options) {
      assert.strictEqual(eventName, 'DOMContentLoaded');
      assert.deepStrictEqual(options, { once: true });
      domReady = listener;
    }
  };

  prepareBrowserScripts(targetWindow);

  assert.strictEqual(targetWindow.module, undefined);
  assert.strictEqual(targetWindow.exports, undefined);
  domReady();
  assert.strictEqual(targetWindow.module, electronModule);
  assert.strictEqual(targetWindow.exports, electronExports);
}

function run() {
  const tests = [
    testFileRendererUrl,
    testDevelopmentRendererUrlPreservesHashRoutes,
    testUnexpectedDevelopmentUrlIsRejected,
    testElectronPreloadUsesBrowserBranchesForGlobalScripts
  ];

  tests.forEach(function (test) {
    test();
    process.stdout.write('ok - ' + test.name + '\n');
  });
}

try {
  run();
} catch (error) {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
}
