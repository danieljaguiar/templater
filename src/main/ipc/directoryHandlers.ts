import { dialog, ipcMain, IpcMainEvent } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import { DirectoryItem } from '../../types/types'

export function registerDirectoryHandlers(): void {
  ipcMain.on(IPC_CHANNELS.DIRECTORY.OPEN, handleOpenFolder)
}

async function handleOpenFolder(event: IpcMainEvent, folderPathArg?: string): Promise<void> {
  let folderPath = folderPathArg
  // if no folderpath then open dialog
  if (!folderPath) {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory', 'promptToCreate', 'showHiddenFiles']
    })
    if (result.canceled) {
      event.reply(IPC_CHANNELS.DIRECTORY.OPEN_REPLY, {
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
  const templateDirectory = getDirectoryStructure(templatesFolderPath)
  const dataDirectory = getDirectoryStructure(dataFolderPath)

  event.reply(IPC_CHANNELS.DIRECTORY.OPEN_REPLY, {
    templateDirectory,
    dataDirectory,
    basePath: folder
  })
}

function getDirectoryStructure(dir: string): DirectoryItem[] {
  const files = fs.readdirSync(dir)
  const structure: DirectoryItem[] = []

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
