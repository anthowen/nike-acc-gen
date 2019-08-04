"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
// eslint-disable-next-line no-unused-vars
import server from "./backend/server.js";

const isDevelopment = process.env.NODE_ENV !== "production";
const iconPath = "../../images/logo.png"; //replace with your own logo

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let activateWindow = null;
let mainWindow = null;

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(["app"], { secure: true });

function createWindow() {
  // Create the browser window.
  activateWindow = new BrowserWindow({
    height: 970,
    width: 1100,
    // minHeight: 700,
    // minWidth: 900,
    // icon: __dirname + iconPath,
    backgroundColor: "#0b1116",
    titleBarStyle: "hiddenInset"
    // show: false //to prevent the white screen when loading the window, lets not show it first
  });

  activateWindow.setMenuBarVisibility(false);

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    // win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

    activateWindow.loadURL(`file://${process.cwd()}/public/activate.html`);
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    activateWindow.loadFile("activate.html");
  }

  activateWindow.on("closed", () => {
    activateWindow = null;
  });

  // server.listen(PORT, () => {
  //   console.log("Listening on *:" + PORT);
  // });
}

/** start of showing new window and close the login window **/
ipcMain.on("mainWindow", function(e) {
  if (mainWindow) {
    mainWindow.focus(); //focus to new window
    return;
  }

  mainWindow = new BrowserWindow({
    //1. create new Window
    width: 1400,
    height: 900,
    minHeight: 850,
    minWidth: 1200,
    titleBarStyle: "hiddenInset"
    // icon: __dirname + iconPath,
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:8080`);
  } else {
    mainWindow.loadFile("index.html");
  }

  mainWindow.once("ready-to-show", () => {
    //when the new window is ready, show it up
    mainWindow.show();
  });

  mainWindow.on("closed", function() {
    //set new window to null when we're done
    mainWindow = null;
  });

  activateWindow.close(); //close the login window(the first window)
});
/** end of showing new window and closing the old one **/

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (activateWindow === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools();
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
