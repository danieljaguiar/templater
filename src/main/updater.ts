import { app, ipcMain } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from '../shared/ipc/channels'

// Configure logging
log.transports.file.level = 'info'
autoUpdater.logger = log

// Set app version in the about panel (macOS)
app.setAboutPanelOptions({
  applicationName: app.getName(),
  applicationVersion: app.getVersion()
})

export function initAutoUpdater(mainWindow: Electron.BrowserWindow): void {
  // Check for updates immediately when app starts
  autoUpdater.checkForUpdatesAndNotify()

  // Check for updates every hour
  setInterval(
    () => {
      autoUpdater.checkForUpdatesAndNotify()
    },
    // 2 minutes
    2 * 60 * 1000
  )

  // Listen for update events
  autoUpdater.on('update-available', () => {
    log.info('Update available')
    mainWindow.webContents.send('update-available')
  })

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded')
    autoUpdater.autoInstallOnAppQuit = true
    mainWindow.webContents.send(IPC_CHANNELS.UPDATE.UPDATE_AVAILABLE)
  })

  ipcMain.on(IPC_CHANNELS.UPDATE.INSTALL_NOW, (event, now) => {
    if (now) {
      log.info('Installing update now')
      autoUpdater.quitAndInstall()
    } else {
      // install on exit
      log.info('Installing update on exit')
    }
  })

  autoUpdater.on('error', (err) => {
    log.error('AutoUpdater error:', err)
  })
}
