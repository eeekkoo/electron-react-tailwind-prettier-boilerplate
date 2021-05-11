/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, Tray, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { AssertionError } from 'assert';

let appTry
let cachedBounds
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
? path.join(process.resourcesPath, 'assets')
: path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = async (show: boolean, x: number, y: number) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: show,
    width: 900,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });


  if (show) {
    mainWindow.setPosition(x, y);
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  
  if (app.dock) app.dock.hide();

  appTry = new Tray(getAssetPath('IconTemplate.png'));
  appTry.setToolTip("Youtube Music Player");
  appTry
    .on('click', clicked);

  //createWindow(false)

}).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});


function clicked (e: any, bounds: any): void {
  if (mainWindow && mainWindow.isVisible()) return hideWindow();

  // workarea takes the taskbar/menubar height in consideration
  var size = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;

  if (bounds) cachedBounds = bounds;

  // ensure bounds is an object
  bounds = bounds || {x:0,y:0};

  // bounds may not be populated on all OSes
  if (bounds.x === 0 && bounds.y === 0) {
    // default to bottom on windows
    bounds.x = size.width + size.x - (340 / 2); // default to right
    cachedBounds = bounds;
  }

  showWindow(bounds);
}

function showWindow (trayPos: any) : void {
  var x =  Math.floor(trayPos.x - ((340 / 2) || 200) + (trayPos.width / 2));
  var y = process.platform === 'win32' ? trayPos.y - 600 : trayPos.y;
  if (!mainWindow) {
    createWindow(true, x, y)
  }

  if (mainWindow) {
    mainWindow.show();
    //mainWindow.openDevTools();
    mainWindow.setPosition(x, y);
  }
}

function hideWindow () {
  if (!mainWindow) return;
  mainWindow.hide();
}