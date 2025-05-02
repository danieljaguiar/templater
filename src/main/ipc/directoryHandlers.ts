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
  const templatesDirectoryPath = join(folder, 'Templates')
  const datasetDirectoryPath = join(folder, 'Datasets')

  if (!fs.existsSync(templatesDirectoryPath)) {
    fs.mkdirSync(templatesDirectoryPath)
  }

  if (!fs.existsSync(datasetDirectoryPath)) {
    fs.mkdirSync(datasetDirectoryPath)
  }

  // Get folder structure for templates directory
  const templateDirectory = getDirectoryStructure(templatesDirectoryPath)
  const datasetDirectory = getDirectoryStructure(datasetDirectoryPath)

  event.reply(IPC_CHANNELS.DIRECTORY.OPEN, {
    templateDirectory,
    datasetDirectory: datasetDirectory,
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

  // Sort the structure by folder first, then by name
  structure.sort((a, b) => {
    if (a.type === DirectoryItemType.FOLDER && b.type !== DirectoryItemType.FOLDER) {
      return -1 // Folders come first
    } else if (a.type !== DirectoryItemType.FOLDER && b.type === DirectoryItemType.FOLDER) {
      return 1 // Files come after folders
    } else {
      return a.name.localeCompare(b.name) // Sort by name
    }
  })

  return structure
}
