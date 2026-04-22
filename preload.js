const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  loginSuccess: () => ipcRenderer.send('window-resize-main'),
  logout: () => ipcRenderer.send('window-resize-login'),
});
