import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import fs from 'fs'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { FileInterface, TreeViewItem } from '../types/types'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('open-folder', async (event, folderPathArg) => {
    let folderPath = folderPathArg
    // if no folderpath then open dialog
    if (!folderPath) {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory', 'promptToCreate', 'showHiddenFiles']
      })
      if (result.canceled) {
        event.reply('open-folder-reply', {
          templateDirectory: [],
          dataDirectory: [],
          basePath: ''
        })
        return
      }
      folderPath = result.filePaths[0]
    }

    const folder = folderPath.toString()
    const templatesFolderPath = join(folder, 'Templates')
    const dataFolderPath = join(folder, 'Data')

    if (!fs.existsSync(templatesFolderPath)) {
      fs.mkdirSync(templatesFolderPath)
    }

    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath)
    }

    // Get folder structure for templates directory
    const getDirectoryStructure = (dir: string): any => {
      const files = fs.readdirSync(dir)
      const structure: TreeViewItem[] = []

      files.forEach((file) => {
        const fullPath = join(dir, file)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
          structure.push({
            fullPath: fullPath,
            name: file,
            type: 'folder',
            children: getDirectoryStructure(fullPath)
          })
        } else {
          structure.push({
            fullPath: fullPath,
            name: file,
            type: 'file'
          })
        }
      })

      return structure
    }

    const templateDirectory = getDirectoryStructure(templatesFolderPath)
    const dataDirectory = getDirectoryStructure(dataFolderPath)

    event.reply('open-folder-reply', {
      templateDirectory,
      dataDirectory,
      basePath: folder
    })
  })

  ipcMain.on('open-file', async (event, filePath) => {
    console.log('Opening file:', filePath)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const fileName = filePath.split('\\').pop() || 'file.txt'
    const fileType = filePath.split('.').pop() || 'txt'

    const file: FileInterface = {
      name: fileName,
      path: filePath,
      type: fileType,
      content: fileContent
    }
    event.reply('on-open-file', file)
  })

  ipcMain.on('save-file', async (event, fileInfo) => {
    // if currentFileName is empty then save as new file
    // if newFileName is empty then save as current file
    // if currentFileName and newFileName is not empty then save as new file and delete old file

    try {
      let filePath = ''

      if (!fileInfo.currentFileName) {
        // Save as new file - show save dialog
        filePath = join(fileInfo.basePath, fileInfo.newFileName)
      } else if (!fileInfo.newFileName) {
        // Save to current file
        filePath = join(fileInfo.basePath, fileInfo.currentFileName)
      } else {
        filePath = join(fileInfo.basePath, fileInfo.newFileName)
        const oldFilePath = join(fileInfo.basePath, fileInfo.currentFileName)

        // Delete the old file if it exists and is different from the new path
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Save the file content
      fs.writeFileSync(filePath, fileInfo.content, 'utf-8')
      console.log('File saved successfully:', filePath)
    } catch (error) {
      console.error('Error saving file:', error)
      event.reply('save-file-reply', {
        success: false,
        message: `Error saving file: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
