'use strict';

var {app, BrowserWindow, Menu, shell, ipcMain} = require('electron');
var fs = require('fs');
var path = require('path');

var mainWindow = null;
var loadingPage = null;
var cbox = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if(process.platform != 'win32') {
    app.quit();
  }
});

app.on('ready', () => {
  createApplicationMenu();
  openWindow();

  // Login success
  ipcMain.on('login-complete', () => {
    mainWindow.hide();
    cbox = new BrowserWindow({width: 800, height: 600, show: true, webPreferences: {nodeIntegration: true, webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
    cbox.on('closed', () => {
      app.quit();
    });
    cbox.loadURL('file://' + __dirname + '/resource/main.html');
    // cbox.hide();
    // cbox.setMenu(null);
    cbox.maximize();
    // cbox.openDevTools();
    // mainWindow.hide();
  });

  // Re-Capture screen event
  ipcMain.on('re-capture', () => {
    cbox.webContents.send('capture');
  });

  // Popup capture control page
  ipcMain.on('capture-done', (event, start, end) => {
    cbox.capturePage({x:start[0], y:start[1], width: end[0] - start[0], height:end[1] - start[1]}, (image) => {
      fs.writeFile(__dirname + "/resource/temp/capture-temp.png", image.toPNG(), (err) => {
          if(err) {
              return console.log(err);
          }
          var captureWindow = new BrowserWindow({width: 800, height: 600, webPreferences:{nodeIntegration: true},icon:  path.join(__dirname, 'resource/icon/dango.png')});
          captureWindow.setMenu(null);
          captureWindow.loadURL('file://' + __dirname + '/resource/capture.html');
          // captureWindow.webContents.openDevTools();
      });
    });
  });
});

var openWindow = () => {
  loadingPage = new BrowserWindow({width: 800, height: 600, resizable: false, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  loadingPage.setMenu(null);
  loadingPage.loadURL('file://' + __dirname + '/resource/loading.html');

  mainWindow = new BrowserWindow({width: 800, height: 600, show: false, webPreferences: {nodeIntegration: true, webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  mainWindow.loadURL('file://' + __dirname + '/resource/login.html');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setMenu(null);
    // mainWindow.maximize();
    mainWindow.show();
    // mainWindow.openDevTools();
    loadingPage.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

var createApplicationMenu = () => {
  var menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Ctrl+Q',
          click: () => {app.quit();}
        }
      ]
    }, {
      label: 'Help',
      submenu: [
        // {
        //   label: 'Vnanime',
        //   click: () => {
        //     shell.openExternal('https://google.com/');
        //   }
        // },
        // {
        //   label: 'About',
        //   click: () => {
        //     var aboutWin = new BrowserWindow({width: 400, height: 200, resizable: false, icon:  path.join(__dirname, 'resource/icon/dango.png')});
        //     aboutWin.setMenu(null);
        //     aboutWin.loadURL('file://' + __dirname + '/resource/about.html');
        //   }
        // },
        {
          label: 'Reload',
          accelerator: 'Ctrl+R',
          click: function() {
            cbox.reload();
          }
        }
      ]
    }, {
      label: 'Capture',
      click: () => {
        cbox.webContents.send('capture');
      }
    }
  ];
  var menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};
