"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { checkXp, getOrders } from "@/print";
const isDevelopment = process.env.NODE_ENV !== "production";
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);
global["X-Token"] = "";
async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 272,
    height: 420,
    title: "佰佳购物",
    show: true,
    autoHideMenuBar: true,
    resizable: false, //禁止改变主窗口尺寸
    webPreferences: {
      nodeIntegration:true,
      enableRemoteModule: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });
  ipcMain.on("set_global", (e, { key, value }) => {
    global[key] = value;
    win.webContents.send('on_get_global', global['X-Token']);
    getOrders(value);
  });
  ipcMain.on("get_xp", () => {
    checkXp(win);
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);    
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  win.webContents.openDevTools()
  
}

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
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
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
