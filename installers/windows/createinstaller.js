const electronInstaller = require('electron-winstaller')
const path = require('path')

const rootPath = path.join('./');
const outPath = path.join(rootPath, 'release-builds');
const settings = {
    appDirectory: path.join(outPath, 'CongApp-win32-x64/'),
    authors: 'Arnun Sae-Lim',
    noMsi: true,
    outputDirectory: path.join(outPath, 'CongApp-Windows-Installer'),
    exe: 'CongApp.exe',
    setupExe: 'CongAppInstaller.exe',
    setupIcon: path.join(rootPath, 'src', 'assets', 'icons', 'cong_icon.ico')
};

console.log(settings);

resultPromise = electronInstaller.createWindowsInstaller(settings);
resultPromise.then(() => {
    console.log("The installers of your application were succesfully created !");
}, (e) => {
    console.log(`Well, sometimes you are not so lucky: ${e.message}`)
});
