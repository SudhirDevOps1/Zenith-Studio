const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const os = require('os');
const { exec, execFile } = require('child_process');

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
      webviewTag: true,
      webSecurity: false, // Allows webview tag and iframes to access internet URLs & localhost freely
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
async function scanDirectory(dirPath, rootPath = dirPath, parentId = null) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  let items = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
    
    // Ignore heavy non-source directories
    if (['node_modules', '.git', 'dist', 'dist-electron', '.next', '.cache'].includes(entry.name)) {
      continue;
    }

    const id = `fs_${Buffer.from(relativePath).toString('base64').replace(/=/g, '')}`;

    if (entry.isDirectory()) {
      items.push({
        id,
        name: entry.name,
        path: relativePath,
        type: 'folder',
        parentId,
        isExpanded: relativePath.split('/').length <= 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      try {
        const subItems = await scanDirectory(fullPath, rootPath, id);
        items = items.concat(subItems);
      } catch (err) {
        console.warn(`Could not read directory ${fullPath}:`, err.message);
      }
    } else if (entry.isFile()) {
      let content = '';
      const ext = path.extname(entry.name).replace('.', '').toLowerCase();
      const isBinary = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'pdf', 'mp3', 'wav', 'mp4', 'xlsx', 'xls'].includes(ext);

      try {
        if (isBinary) {
          const buffer = await fs.readFile(fullPath);
          const mimeTypes = {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
            webp: 'image/webp', ico: 'image/x-icon', pdf: 'application/pdf',
            mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            xls: 'application/vnd.ms-excel'
          };
          const mime = mimeTypes[ext] || 'application/octet-stream';
          content = `data:${mime};base64,${buffer.toString('base64')}`;
        } else {
          content = await fs.readFile(fullPath, 'utf-8');
        }
      } catch (e) {
        content = '';
      }

      items.push({
        id,
        name: entry.name,
        path: relativePath,
        type: 'file',
        parentId,
        extension: ext,
        content,
        isModified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  return items;
}

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Supported Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md', 'mermaid', 'py', 'cpp', 'java', 'sql', 'yaml', 'txt', 'csv', 'tsv', 'svg'] },
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

  const folderPath = result.filePaths[0];
  activeTerminalCwd = folderPath;
  const folderName = path.basename(folderPath);
  const files = await scanDirectory(folderPath);
  return { folderPath, folderName, files };
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

// Open external URL in system browser
ipcMain.handle('shell:openExternal', async (_, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

// Execute real system shell command in active workspace directory
let activeTerminalCwd = os.homedir();

ipcMain.handle('terminal:execCommand', async (_, { command, cwd }) => {
  return new Promise((resolve) => {
    let workingDir = cwd && typeof cwd === 'string' && fsSync.existsSync(cwd)
      ? cwd
      : activeTerminalCwd && fsSync.existsSync(activeTerminalCwd)
      ? activeTerminalCwd
      : os.homedir();

    const trimmed = (command || '').trim();

    // Special handling for cd command to persist directory changes across shell calls
    if (trimmed.toLowerCase().startsWith('cd ') || trimmed.toLowerCase() === 'cd') {
      const target = trimmed.slice(2).trim().replace(/^["']|["']$/g, '');
      if (!target || target === '~') {
        activeTerminalCwd = os.homedir();
        resolve({ code: 0, stdout: '', stderr: '', cwd: activeTerminalCwd });
        return;
      }

      const resolved = path.isAbsolute(target) ? path.normalize(target) : path.resolve(workingDir, target);
      if (fsSync.existsSync(resolved) && fsSync.statSync(resolved).isDirectory()) {
        activeTerminalCwd = resolved;
        resolve({ code: 0, stdout: '', stderr: '', cwd: activeTerminalCwd });
      } else {
        resolve({
          code: 1,
          stdout: '',
          stderr: `Set-Location : Cannot find path '${target}' because it does not exist.\n`,
          cwd: workingDir,
        });
      }
      return;
    }

    const isWin = process.platform === 'win32';
    const shellOpt = isWin ? 'powershell.exe' : '/bin/bash';

    exec(command, { cwd: workingDir, shell: shellOpt, maxBuffer: 1024 * 1024 * 10, timeout: 180000 }, (error, stdout, stderr) => {
      resolve({
        code: error ? (error.code !== undefined ? error.code : 1) : 0,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null,
        cwd: workingDir,
      });
    });
  });
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
