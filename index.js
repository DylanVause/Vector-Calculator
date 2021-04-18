const { app, BrowserWindow, webContents, ipcMain } = require('electron')

/* Electron hot-reload for rapid development.  However, because the config file is constantly being written, 
 * and elecron-reload restarts the app whenever it detects a file save, this can get quite annoying. 
*/
//require('electron-reload')(__dirname);

/*
// Experimental code for auto-updating
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

// Creating a new window.
let win = null;
function createWindow () {
  win = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 300,
    minHeight: 300,
    icon: __dirname + '/app/resources/icons/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Load in the index.html page.  This is the main page for the app.
  win.loadFile('./app/index.html')

  // Remove electron menu bar
  win.removeMenu();
}

// Create the main window when the app is ready
app.whenReady().then(createWindow)

// Message listener for changing if the app stays on top of other windows
ipcMain.on('set-keep-on-top', (event, bKeepOnTop) => {
  win.setAlwaysOnTop(bKeepOnTop);
  event.returnValue = bKeepOnTop;
})

// Message listener to return the current version of Vector Calculator, which comes from package.json
ipcMain.on('get-version', (event) => {
  event.returnValue = app.getVersion();
})

// Quit the program if all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})