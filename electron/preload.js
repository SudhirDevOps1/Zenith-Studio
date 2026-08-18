const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  openWorkspacePath: (folderPath) => ipcRenderer.invoke('fs:openWorkspacePath', folderPath),
  saveFileAsDialog: (options) => ipcRenderer.invoke('dialog:saveFileAs', options),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  saveFile: (data) => ipcRenderer.invoke('fs:saveFile', data),
  deleteItem: (data) => ipcRenderer.invoke('fs:deleteItem', data),
  renameItem: (data) => ipcRenderer.invoke('fs:renameItem', data),
  runNativeCode: (data) => ipcRenderer.invoke('code:runNative', data),
  execTerminalCommand: (data) => ipcRenderer.invoke('terminal:execCommand', data),
  searchOpenVSX: (query) => ipcRenderer.invoke('openvsx:search', query),
  getPopularOpenVSX: () => ipcRenderer.invoke('openvsx:popular'),
  getExtensionDetails: (data) => ipcRenderer.invoke('openvsx:extension', data),
  aiFetch: (data) => ipcRenderer.invoke('ai:fetch', data),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openHtmlPreview: (data) => ipcRenderer.invoke('browser:openHtmlPreview', data),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // 🛡️ Enterprise OS Credential Vault (VS Code standard)
  setSecret: (key, value) => ipcRenderer.invoke('vault:setSecret', { key, value }),
  getSecret: (key) => ipcRenderer.invoke('vault:getSecret', { key }),
  deleteSecret: (key) => ipcRenderer.invoke('vault:deleteSecret', { key }),
  hasSecret: (key) => ipcRenderer.invoke('vault:hasSecret', { key }),
});



