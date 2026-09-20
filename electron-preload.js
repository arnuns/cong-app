'use strict';

function prepareBrowserScripts(targetWindow) {
  const electronModule = targetWindow.module;
  const electronExports = targetWindow.exports;

  targetWindow.module = undefined;
  targetWindow.exports = undefined;
  targetWindow.addEventListener('DOMContentLoaded', function () {
    targetWindow.module = electronModule;
    targetWindow.exports = electronExports;
  }, { once: true });
}

module.exports = {
  prepareBrowserScripts: prepareBrowserScripts
};

if (typeof window !== 'undefined') {
  prepareBrowserScripts(window);
}
