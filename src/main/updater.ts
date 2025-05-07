import { app, dialog } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

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
    60 * 60 * 1000
  )

  // Listen for update events
  autoUpdater.on('update-available', () => {
    log.info('Update available')
    mainWindow.webContents.send('update-available')
  })

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded')

    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart the application to apply the updates.',
        buttons: ['Restart', 'Later']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  autoUpdater.on('error', (err) => {
    log.error('AutoUpdater error:', err)
  })
}
