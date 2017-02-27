'use strict';

var {app, ipcMain, BrowserWindow, Menu, shell} = require('electron');
var fs = require('fs');
var path = require('path')

var mainWindow = null;
var loadingPage = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if(process.platform != 'win32') {
    app.quit();
  }
});

app.on('ready', function() {
  createApplicationMenu();
  openWindow();
  ipcMain.on('re-capture', () => {
    mainWindow.webContents.send('capture');
  });
  ipcMain.on('capture-done', (event, start, end) => {
    mainWindow.capturePage({x:start[0], y:start[1], width: end[0] - start[0], height:end[1] - start[1]}, (image) => {
      fs.writeFile(__dirname + "/resource/temp/capture-temp.png", image.toPNG(), function(err) {
          if(err) {
              return console.log(err);
          }
          var captureWindow = new BrowserWindow({width: 800, height: 600, webPreferences:{nodeIntegration: true},icon:  path.join(__dirname, 'resource/icon/dango.png')});
          captureWindow.setMenu(null);
          captureWindow.loadURL('file://' + __dirname + '/resource/capture.html');
          captureWindow.webContents.openDevTools();
      });
    });
  })
});

var openWindow = function() {
  loadingPage = new BrowserWindow({width: 800, height: 600, resizable: false, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  loadingPage.setMenu(null);
  loadingPage.loadURL('file://' + __dirname + '/resource/loading.html');

  mainWindow = new BrowserWindow({width: 800, height: 600, show: false, webPreferences: {experimentalCanvasFeatures:true,nodeIntegration: true,webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  // mainWindow.setMenu(null);
  // mainWindow.loadURL('http://google.com/');
  mainWindow.loadURL('file://' + __dirname + '/resource/test.html');
  mainWindow.webContents.on('did-start-loading', function(){
    // mainWindow.webContents.insertCSS(fs.readFileSync('resource/css/loading-indicator.css', 'utf8'));
    // mainWindow.webContents.executeJavaScript("window.$ = window.jQuery = require('jquery');");
  });
  mainWindow.webContents.on('did-finish-load', function(){
    mainWindow.maximize();
    mainWindow.show();
    loadingPage.hide();
    mainWindow.webContents.openDevTools();
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
        mainWindow.webContents.send('capture');
      }
    }
  ];
  var menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};
