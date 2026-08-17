const assert = require('assert');
const path = require('path');
const asar = require('asar');

const packagePath = path.resolve(
  __dirname,
  '../release/win-unpacked/resources/app.asar'
);
const packageFiles = asar.listPackage(packagePath);
const mainBundlePath = packageFiles.find((filePath) =>
  /^\/dist\/main(?:\.[a-f0-9]+)?\.js$/.test(filePath)
);

assert(mainBundlePath, 'The packaged app must contain the Angular main bundle.');

const mainBundle = asar
  .extractFile(packagePath, mainBundlePath.replace(/^\//, ''))
  .toString();
const indexHtml = asar.extractFile(packagePath, 'dist/index.html').toString();

assert(
  indexHtml.includes('<base href="./">'),
  'The packaged Electron index must use a relative base URL.'
);
assert(
  mainBundle.includes('../dist/assets'),
  'The packaged Angular bundle must resolve report images from dist/assets.'
);
assert(
  !mainBundle.includes('basePath:"../assets"') &&
    !mainBundle.includes("basePath: '../assets'"),
  'The packaged Angular bundle must not contain the development report-image path.'
);

[
  '/dist/assets/img/logo-header.png',
  '/dist/assets/img/esignature001.jpg',
].forEach((assetPath) => {
  assert(
    packageFiles.includes(assetPath),
    `The packaged app must contain ${assetPath}.`
  );
});

console.log('Electron release assets resolve from the packaged dist directory.');
