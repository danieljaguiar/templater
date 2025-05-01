import { dialog, ipcMain, IpcMainEvent } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  DirectoryItem,
  DirectoryItemType,
  ExtractBaseFileFolderInfoFromFullPath
} from '../../types/types'

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

  event.reply(IPC_CHANNELS.DIRECTORY.OPEN, {
    templateDirectory,
    dataDirectory,
    basePath: folder.replace(/\\/g, '/')
  })
}

function getDirectoryStructure(dir: string): DirectoryItem[] {
  const allItemsInDirectory = fs.readdirSync(dir)
  const structure: DirectoryItem[] = []

  allItemsInDirectory.forEach((itemInDirectory) => {
    const itemFullPath = join(dir, itemInDirectory)
    const itemFullPathForwardSlash = itemFullPath.replace(/\\/g, '/')
    const stats = fs.statSync(itemFullPath)
    const type: DirectoryItemType = stats.isDirectory()
      ? DirectoryItemType.FOLDER
      : DirectoryItemType.FILE
    const base = ExtractBaseFileFolderInfoFromFullPath(itemFullPathForwardSlash, type)
    if (type === DirectoryItemType.FOLDER) {
      structure.push({
        ...base,
        fullPath: itemFullPathForwardSlash,
        children: getDirectoryStructure(itemFullPath)
      })
    } else {
      structure.push({
        ...base,
        fullPath: itemFullPathForwardSlash
      })
    }
  })

  return structure
}
