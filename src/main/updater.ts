import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from '../shared/ipc/channels'
import { AppLogger, Source } from './logger'

const logger = new AppLogger(Source.UPDATER)

// Configure logging
autoUpdater.logger = logger

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
    // 60 minutes
    60 * 60 * 1000
  )

  // Listen for update events
  autoUpdater.on('update-available', () => {
    logger.info('Update available')
    mainWindow.webContents.send('update-available')
  })

  autoUpdater.on('update-downloaded', () => {
    logger.info('Update downloaded')
    autoUpdater.autoInstallOnAppQuit = true
    mainWindow.webContents.send(IPC_CHANNELS.UPDATE.UPDATE_AVAILABLE)
  })

  ipcMain.on(IPC_CHANNELS.UPDATE.INSTALL_NOW, (event, now) => {
    if (now) {
      logger.info('Installing update now')

      autoUpdater.quitAndInstall()
    }
  })

  autoUpdater.on('error', (err) => {
    logger.error(`Error in auto-updater: ${err}`)
  })
}
