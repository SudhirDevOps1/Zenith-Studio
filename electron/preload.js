const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  saveFile: (data) => ipcRenderer.invoke('fs:saveFile', data),
  runNativeCode: (data) => ipcRenderer.invoke('code:runNative', data),
  execTerminalCommand: (data) => ipcRenderer.invoke('terminal:execCommand', data),
  searchOpenVSX: (query) => ipcRenderer.invoke('openvsx:search', query),
  getExtensionDetails: (data) => ipcRenderer.invoke('openvsx:extension', data),
  aiFetch: (data) => ipcRenderer.invoke('ai:fetch', data),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
});


