'use strict';

var {app} = require('electron');
var {BrowserWindow} = require('electron');
var {Menu} = require('electron');
var {shell} = require('electron');
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
});

var openWindow = function() {
  loadingPage = new BrowserWindow({width: 800, height: 600, resizable: false, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  loadingPage.setMenu(null);
  loadingPage.loadURL('file://' + __dirname + '/resource/loading.html');

  mainWindow = new BrowserWindow({width: 800, height: 600, show: false, webPreferences: {nodeIntegration: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  // mainWindow.setMenu(null);
  mainWindow.loadURL('http://google.com/');
  mainWindow.webContents.on('did-start-loading', function(){
    // mainWindow.webContents.insertCSS(fs.readFileSync('resource/css/loading-indicator.css', 'utf8'));
    // mainWindow.webContents.executeJavaScript("window.$ = window.jQuery = require('jquery');");
  });
  mainWindow.webContents.on('did-finish-load', function(){
    mainWindow.maximize();
    mainWindow.show();
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
    }
  ];
  var menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};