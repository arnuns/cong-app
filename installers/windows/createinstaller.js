const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })

function getInstallerConfig() {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds')
    return Promise.resolve({
        appDirectory: path.join(outPath, 'CongApp-win32-ia32/'),
        authors: 'Arnun Sae-Lim',
        noMsi: true,
        outputDirectory: path.join(outPath, 'CongApp-Windows-Installer'),
        exe: 'CongApp.exe',
        setupExe: 'CongAppInstaller.exe',
        setupIcon: path.join(rootPath, 'src', 'assets', 'icons', 'cong_icon.ico')
    })
}