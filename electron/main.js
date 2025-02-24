import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 🔥 Fix: Load Vue app properly
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173'); // Vite Dev Server
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html')); // Production Build
  }

  // Open DevTools (Helpful for debugging)
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);