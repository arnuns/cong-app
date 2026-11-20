const assert = require('assert');
const { createHash } = require('crypto');
const fs = require('fs');
const { createRequire } = require('module');
const path = require('path');
const asar = require('asar');
const { productName, version } = require('../package.json');

const releasePath = path.resolve(__dirname, '../release');
const packagePath = path.join(releasePath, 'win-unpacked/resources/app.asar');
const packageFiles = asar.listPackage(packagePath).map(file => file.replace(/\\/g, '/'));
const localFiles = packageFiles.filter(file =>
  /^(?:\/src)?\/\.env(?:\.|$)/.test(file) || /^\/release-builds(?:\/|$)/.test(file)
);
assert.strictEqual(localFiles.length, 0, 'The packaged app contains local files: ' + localFiles.join(', '));
const packagedVersion = JSON.parse(asar.extractFile(packagePath, 'package.json').toString()).version;
assert.strictEqual(packagedVersion, version, 'The packaged app must match the release version.');

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
  '/main.js',
  '/electron-renderer-url.js',
  '/electron-preload.js',
  '/dist/assets/img/logo-header.png',
  '/dist/assets/img/esignature001.jpg',
].forEach((assetPath) => {
  assert(
    packageFiles.includes(assetPath),
    `The packaged app must contain ${assetPath}.`
  );
});

async function verifyInstaller() {
  const requireUpdater = createRequire(require.resolve('electron-updater/package.json'));
  const { load } = requireUpdater('js-yaml');
  const update = load(fs.readFileSync(path.join(releasePath, 'latest.yml'), 'utf8'));
  const installerName = `${productName} Setup ${version}.exe`;
  const assetName = installerName.replace(/ /g, '-');
  const installerPath = path.join(releasePath, installerName);

  assert.strictEqual(update.version, version, 'latest.yml must match the release version.');
  assert.strictEqual(update.path, assetName, 'latest.yml must name the published installer.');
  assert.strictEqual(update.files.length, 1, 'latest.yml must describe one installer.');
  const [file] = update.files;
  assert.strictEqual(file.url, assetName, 'latest.yml must point to the published installer.');
  assert.strictEqual(file.size, fs.statSync(installerPath).size, 'The installer size must match latest.yml.');
  assert(fs.statSync(installerPath + '.blockmap').size > 0, 'The installer blockmap must be nonempty.');

  const hash = createHash('sha512');
  for await (const chunk of fs.createReadStream(installerPath)) {
    hash.update(chunk);
  }
  const sha512 = hash.digest('base64');
  assert.strictEqual(update.sha512, sha512, 'The installer SHA-512 must match latest.yml.');
  assert.strictEqual(file.sha512, sha512, 'The installer file SHA-512 must match latest.yml.');
  console.log(`Verified Electron ${version} package contents, installer and auto-update metadata.`);
}

verifyInstaller().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
