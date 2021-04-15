const { app, BrowserWindow, webContents, ipcMain } = require('electron')

//require('electron-reload')(__dirname);

/*
app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--new-window',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'New Window',
    description: 'Create a new window'
  }
]);
*/

let win = null;

function createWindow () {
  win = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 300,
    minHeight: 300,
    icon: __dirname + '/app/resources/icons/icon.png',
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('./app/index.html')

  win.removeMenu();
}

app.whenReady().then(createWindow)


ipcMain.on('set-keep-on-top', (event, bKeepOnTop) => {
  win.setAlwaysOnTop(bKeepOnTop);
  event.returnValue = bKeepOnTop;
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})