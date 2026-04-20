const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add any native desktop features here if needed (e.g. printing, file system)
  platform: process.platform,
});
