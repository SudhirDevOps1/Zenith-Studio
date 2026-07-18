const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { execFile } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'CodeStudio',
    backgroundColor: '#14141f',
    frame: false, // Custom styled window titlebar
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL;

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Create standard menu bar template
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('menu:new-file') },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu:save-file') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// Window Controls IPC
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());

// Native File System IPC
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Supported Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md', 'mermaid', 'py', 'cpp', 'java', 'sql', 'yaml', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, 'utf-8');
  return { filePath, name: path.basename(filePath), content };
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:saveFile', async (_, { path: targetPath, content }) => {
  try {
    let savePath = targetPath;
    if (!savePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save File As',
      });
      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }
      savePath = result.filePath;
    }

    await fs.writeFile(savePath, content, 'utf-8');
    return { success: true, path: savePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('code:runNative', async (_, { code, extension, fileName }) => {
  const ext = String(extension || '').toLowerCase();
  const isCpp = ['cpp', 'cc', 'cxx'].includes(ext);
  const isC = ext === 'c';

  if (!isCpp && !isC) {
    return { code: 1, stdout: '', stderr: '', error: 'Native compiler currently supports C and C++ only.' };
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codestudio-'));
  const sourcePath = path.join(tempDir, fileName || `main.${ext}`);
  const outputPath = path.join(tempDir, process.platform === 'win32' ? 'program.exe' : 'program');
  const compiler = isCpp ? 'g++' : 'gcc';

  try {
    await fs.writeFile(sourcePath, code, 'utf-8');

    const compilerArgs = isCpp ? [sourcePath, '-O2', '-std=c++17', '-o', outputPath] : [sourcePath, '-O2', '-std=c11', '-o', outputPath];
    const compileResult = await new Promise((resolve) => {
      execFile(compiler, compilerArgs, { timeout: 15000 }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });

    if (compileResult.error) {
      return {
        code: compileResult.error.code || 1,
        stdout: compileResult.stdout || '',
        stderr: compileResult.stderr || '',
        error: `Compile failed. Make sure ${compiler} is installed and available in PATH.`,
      };
    }

    const runResult = await new Promise((resolve) => {
      execFile(outputPath, [], { timeout: 10000 }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });

    return {
      code: runResult.error ? runResult.error.code || 1 : 0,
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error ? runResult.error.message : '',
    };
  } catch (err) {
    return { code: 1, stdout: '', stderr: '', error: err.message || String(err) };
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
