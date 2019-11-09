//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
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
app.on('ready', createWindow)

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
    show: false
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
    show: false
  })
  winThree.loadURL(`file://${__dirname}/dist/index.html#/employee/${empNo}/document/${documentId}`)
  winThree.once('ready-to-show', () => {
    winThree.show()
    //winThree.webContents.openDevTools()
  })
})

ipcMain.on('view-report', (event, empNo) => {
  winReport = new BrowserWindow({
    width: 826,
    height: 1169,
    minWidth: 826,
    minHeight: 1169,
    maxWidth: 826,
    maxHeight: 1169,
    parent: 'top',
    modal: true,
    show: false
  })
  winReport.loadURL(`file://${__dirname}/dist/index.html#/report/transfer/${empNo}`)
  winReport.once('ready-to-show', () => {
    winReport.show()
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
    show: false
  })
  winPayslip.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html#/report/payslip?payrollcycleid=${payrollCycleId}&siteid=${siteId}`),
      protocol: "file:",
      slashes: true
    })
  )
  winPayslip.once('ready-to-show', () => {
    winPayslip.show()
  })
})

ipcMain.on('view-employee-profile', (event, empNo) => {
  winEmployee = new BrowserWindow({
    width: 826,
    height: 1169,
    minWidth: 826,
    minHeight: 1169,
    maxWidth: 826,
    maxHeight: 1169,
    parent: 'top',
    modal: true,
    show: false
  })
  winEmployee.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html#/report/employeeprofile?empno=${empNo}`),
      protocol: "file:",
      slashes: true
    })
  )
  winEmployee.once('ready-to-show', () => {
    winEmployee.show()
  })
})

ipcMain.on('view-employee-profile-mini', (event, empNo) => {
  winEmployeeMini = new BrowserWindow({
    width: 826,
    height: 1169,
    minWidth: 826,
    minHeight: 1169,
    maxWidth: 826,
    maxHeight: 1169,
    parent: 'top',
    modal: true,
    show: false
  })
  winEmployeeMini.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html#/report/employeeprofilemini?empno=${empNo}`),
      protocol: "file:",
      slashes: true
    })
  )
  winEmployeeMini.once('ready-to-show', () => {
    winEmployeeMini.show()
  })
})

ipcMain.on('view-license', (event, empNo) => {
  winLicense = new BrowserWindow({
    width: 826,
    height: 1169,
    minWidth: 826,
    minHeight: 1169,
    maxWidth: 826,
    maxHeight: 1169,
    parent: 'top',
    modal: true,
    show: false
  })
  winLicense.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html#/report/license?empno=${empNo}`),
      protocol: "file:",
      slashes: true
    })
  )
  
  winLicense.once('ready-to-show', () => {
    winLicense.show()
  })
})

ipcMain.on('view-employee-card', (event, empNo) => {
  winEmployeeCard = new BrowserWindow({
    width: 826,
    height: 1169,
    minWidth: 826,
    minHeight: 1169,
    maxWidth: 826,
    maxHeight: 1169,
    parent: 'top',
    modal: true,
    show: false
  })
  winEmployeeCard.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html#/report/employeecard?empno=${empNo}`),
      protocol: "file:",
      slashes: true
    })
  )

  winEmployeeCard.once('ready-to-show', () => {
    winEmployeeCard.show()
  })
})

ipcMain.on('view-working-site-report', (event, siteId, year, month) => {
  winWorkingSiteReport = new BrowserWindow({
    width: 1169,
    height: 826,
    minWidth: 1169,
    minHeight: 826,
    maxWidth: 1169,
    maxHeight: 826,
    parent: 'top',
    modal: true,
    show: false
  })
  winWorkingSiteReport.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html#/report/workingsite?siteId=${siteId}&year=${year}&month=${month}`),
      protocol: "file:",
      slashes: true
    })
  )
  winWorkingSiteReport.once('ready-to-show', () => {
    winWorkingSiteReport.show()
  })
})

ipcMain.on('print-to-pdf', (event) => {
  const dd = new Date();
  const dateString = '' + dd.getFullYear() + (dd.getMonth() + 1) + (dd.getDate()) + dd.getHours() + dd.getMinutes() + dd.getSeconds();
  const pdfPath = `${os.tmpdir()}/print_${dateString}.pdf`;
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.printToPDF({ marginsType: 2, pageSize: 'A4', printBackground: true }, (error, data) => {
    if (error) return console.log(error.message);
    fs.writeFile(pdfPath, data, (err) => {
      if (err) return console.log(err.message);
      shell.openExternal(`file://${pdfPath}`);
      win.close();
    });
  });
})

ipcMain.on('print-to-pdf-landscape', (event) => {
  const dd = new Date();
  const dateString = '' + dd.getFullYear() + (dd.getMonth() + 1) + (dd.getDate()) + dd.getHours() + dd.getMinutes() + dd.getSeconds();
  const pdfPath = `${os.tmpdir()}/print_${dateString}.pdf`;
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.printToPDF({ landscape: true, marginsType: 2, pageSize: 'A4', printBackground: true }, (error, data) => {
    if (error) return console.log(error.message);
    fs.writeFile(pdfPath, data, (err) => {
      if (err) return console.log(err.message);
      shell.openExternal(`file://${pdfPath}`);
      win.close();
    });
  });
})

ipcMain.on('navigate-main-to-edit-employee', (event, empNo) => {
  const employeeUrl = '/employee';
  win.loadURL(url.format({
    pathname: path.join(__dirname, `/dist/index.html#/employee/edit/${empNo}?backUrl=${employeeUrl}`),
    protocol: "file:",
    slashes: true
  }));
  win.show();
})