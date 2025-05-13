import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'
import { join } from 'path'

export function createSplashWindow(): BrowserWindow {
  const splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/splash.ts'),
      contextIsolation: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splashWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`) // Ensure this matches your filename
  } else {
    splashWindow.loadFile(join(__dirname, '../renderer/splash.html')) // Ensure this matches your filename
  }

  splashWindow.webContents.on('did-finish-load', () => {
    if (splashWindow) {
      splashWindow.show()
      splashWindow.focus()
      splashWindow.setAlwaysOnTop(true)
    }
  })

  return splashWindow
}
