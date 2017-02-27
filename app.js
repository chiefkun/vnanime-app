'use strict';

var {app, BrowserWindow, Menu, shell} = require('electron');
var {ipcMain} = require('electron');
var fs = require('fs');
var path = require('path')

var mainWindow = null;
var loadingPage = null;
var cbox = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if(process.platform != 'win32') {
    app.quit();
  }
});

app.on('ready', function() {
  createApplicationMenu();
  openWindow();

  ipcMain.on('login-complete', function() {
    // loadingPage.show();
    mainWindow.hide();
    cbox = new BrowserWindow({width: 800, height: 600, show: true, webPreferences: {nodeIntegration: true, webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
    cbox.loadURL('file://' + __dirname + '/resource/main.html');
    // cbox.hide();
    // cbox.setMenu(null);
    cbox.maximize();
    // cbox.openDevTools();
    // mainWindow.hide();
  });
  ipcMain.on('re-capture', () => {
    cbox.webContents.send('capture');
  });
  ipcMain.on('capture-done', (event, start, end) => {
    cbox.capturePage({x:start[0], y:start[1], width: end[0] - start[0], height:end[1] - start[1]}, (image) => {
      fs.writeFile(__dirname + "/resource/temp/capture-temp.png", image.toPNG(), function(err) {
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
  ipcMain.on('call-capture', () => {
    cbox.webContents.send('capture');
  });
});

var openWindow = function() {
  loadingPage = new BrowserWindow({width: 800, height: 600, resizable: false, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  loadingPage.setMenu(null);
  loadingPage.loadURL('file://' + __dirname + '/resource/loading.html');

  mainWindow = new BrowserWindow({width: 800, height: 600, show: false, webPreferences: {nodeIntegration: true, webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  mainWindow.loadURL('file://' + __dirname + '/resource/login.html');
  mainWindow.webContents.on('did-finish-load', function(){
    mainWindow.setMenu(null);
    // mainWindow.maximize();
    mainWindow.show();
    // mainWindow.openDevTools();
    loadingPage.hide();
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
};

var createApplicationMenu = function() {
  var menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Ctrl+Q',
          click: function () {app.quit();}
        }
      ]
    }, {
      label: 'Help',
      submenu: [
        {
          label: 'Vnanime',
          click: function() {
            shell.openExternal('https://google.com/');
          }
        },
        {
          label: 'About',
          click: function() {
            var aboutWin = new BrowserWindow({width: 400, height: 200, resizable: false, icon:  path.join(__dirname, 'resource/icon/dango.png')});
            aboutWin.setMenu(null);
            aboutWin.loadURL('file://' + __dirname + '/resource/about.html');
          }
        }
      ]
    }, {
      label: 'Capture',
      click: function() {
        cbox.webContents.send('capture');
      }
    }
  ];
  var menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};
