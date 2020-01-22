//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const os = require('os');
const url = require("url");
const path = require("path");

let win, winTwo, winThree, winReport;

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

function createWindow() {
  // Create the browser window
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: '#E0E2E4',
    icon: `file://${__dirname}/dist/assets/icons/png/64x64.png`,
    title: 'CONG',
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  // win.loadFile('dist/index.html')

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

  // Insert menu
  Menu.setApplicationMenu(mainMenu)

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // win = null
    app.quit()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('online-status-changed', (event, status) => {
  console.log(status)
})

ipcMain.on('read-card', (event) => {
  var child = require('child_process').execFile;
  var executablePath = "C:\\cong\\CardReader.exe";
  child(executablePath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }
    const fs = require("fs");
    fs.readFile('C:\\cong\\data.txt', function (err, data) {
      if (err) {
        return console.error(err);
      }
      event.returnValue = data.toString();
    });
  });
})

ipcMain.on('view-user', (event, empNo) => {
  winTwo = new BrowserWindow({
    width: 800,
    height: 1024,
    minWidth: 800,
    minHeight: 768,
    maxWidth: 800,
    maxHeight: 1024,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winTwo.loadURL(`file://${__dirname}/dist/index.html#/employee/detail/${empNo}`)
  winTwo.once('ready-to-show', () => {
    winTwo.show()
    // winTwo.webContents.openDevTools()
  })
})

ipcMain.on('view-document', (event, empNo, documentId) => {
  winThree = new BrowserWindow({
    width: 1024,
    height: 1024,
    minWidth: 1024,
    minHeight: 768,
    maxWidth: 1024,
    maxHeight: 1024,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winThree.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/document/${documentId}`)
  winThree.once('ready-to-show', () => {
    winThree.show()
    // winThree.webContents.openDevTools()
  })
})

ipcMain.on('view-employee-transfer', (event, empNo) => {
  winEmployeeTransfer = new BrowserWindow({
    width: 1068,
    height: 1562,
    minWidth: 1068,
    minHeight: 1562,
    maxWidth: 1068,
    maxHeight: 1562,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winEmployeeTransfer.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/report/employee-transfer`)
  winEmployeeTransfer.once('ready-to-show', () => {
    winEmployeeTransfer.show()
    // winEmployeeTransfer.webContents.openDevTools()
  })
})

ipcMain.on('view-payslip', (event, payrollCycleId, siteId) => {
  winPayslip = new BrowserWindow({
    width: 826,
    height: 1169,
    minWidth: 826,
    minHeight: 1169,
    maxWidth: 826,
    maxHeight: 1169,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winPayslip.loadURL(`file://${__dirname}/dist/index.html#/payroll/${payrollCycleId}/site/${siteId}/payslip`)
  winPayslip.once('ready-to-show', () => {
    winPayslip.show()
    // winPayslip.webContents.openDevTools()
  })
})

ipcMain.on('view-employee-profile', (event, empNo) => {
  winEmployeeProfile = new BrowserWindow({
    width: 1068,
    height: 1562,
    minWidth: 1068,
    minHeight: 1562,
    maxWidth: 1068,
    maxHeight: 1562,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winEmployeeProfile.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/report/employee-profile`)
  winEmployeeProfile.once('ready-to-show', () => {
    winEmployeeProfile.show()
  })
})

ipcMain.on('view-employee-profile-mini', (event, empNo) => {
  winEmployeeProfileMini = new BrowserWindow({
    width: 1068,
    height: 1562,
    minWidth: 1068,
    minHeight: 1562,
    maxWidth: 1068,
    maxHeight: 1562,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winEmployeeProfileMini.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/report/employee-profile-mini`)
  winEmployeeProfileMini.once('ready-to-show', () => {
    winEmployeeProfileMini.show()
  })
})

ipcMain.on('view-employee-license', (event, empNo) => {
  winEmployeeLicense = new BrowserWindow({
    width: 1068,
    height: 1562,
    minWidth: 1068,
    minHeight: 1562,
    maxWidth: 1068,
    maxHeight: 1562,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  winEmployeeLicense.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/report/employee-license`)
  winEmployeeLicense.once('ready-to-show', () => {
    winEmployeeLicense.show()
  })
})

ipcMain.on('view-employee-card', (event, empNo) => {
  winEmployeeCard = new BrowserWindow({
    width: 1068,
    height: 1562,
    minWidth: 1068,
    minHeight: 1562,
    maxWidth: 1068,
    maxHeight: 1562,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  winEmployeeCard.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/report/employee-card`)
  winEmployeeCard.once('ready-to-show', () => {
    winEmployeeCard.show()
    // winEmployeeCard.webContents.openDevTools()
  })
})

ipcMain.on('view-working-site-report', (event, siteId, year, month) => {
  winWorkingSiteReport = new BrowserWindow({
    width: 1562,
    height: 1068,
    minWidth: 1562,
    minHeight: 1068,
    maxWidth: 1562,
    maxHeight: 1068,
    parent: 'top',
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  winWorkingSiteReport.loadURL(`file://${__dirname}/dist/index.html#/time-attendance/working-site/${siteId}/year/${year}/month/${month}/report`)
  winWorkingSiteReport.once('ready-to-show', () => {
    winWorkingSiteReport.show()
    // winWorkingSiteReport.webContents.openDevTools()
  })
})

ipcMain.on('print-to-pdf', (event) => {
  const dd = new Date();
  const dateString = '' + dd.getFullYear() + (dd.getMonth() + 1) + (dd.getDate()) + dd.getHours() + dd.getMinutes() + dd.getSeconds();
  const pdfPath = `${os.tmpdir()}/print_${dateString}.pdf`;
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.printToPDF({ marginsType: 2, pageSize: 'A4',  printBackground: true }, (error, data) => {
    if (error) throw error
    fs.writeFile(pdfPath, data, (error) => {
      if (error) throw error
      shell.openExternal(`file://${pdfPath}`);
      event.sender.send('wrote-pdf', pdfPath)
      win.close();
    })
  })
})

ipcMain.on('print-to-pdf-landscape', (event) => {
  const dd = new Date();
  const dateString = '' + dd.getFullYear() + (dd.getMonth() + 1) + (dd.getDate()) + dd.getHours() + dd.getMinutes() + dd.getSeconds();
  const pdfPath = `${os.tmpdir()}/print_${dateString}.pdf`;
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.printToPDF({ landscape: true, marginsType: 2, pageSize: 'A4', printBackground: true }, (error, data) => {
    if (error) throw error
    fs.writeFile(pdfPath, data, (error) => {
      if (error) throw error
      shell.openExternal(`file://${pdfPath}`);
      event.sender.send('wrote-pdf', pdfPath)
      win.close();
    });
  });
})

ipcMain.on('navigate-main-to-edit-employee', (event, empNo) => {
  const employeeUrl = '/employee';
  win.loadURL(`file://${__dirname}/dist/index.html#/employee/edit/${empNo}?backUrl=${employeeUrl}`)
  win.show();
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});