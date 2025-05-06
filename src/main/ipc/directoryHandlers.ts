import { dialog, ipcMain, IpcMainEvent } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  DirectoryItem,
  DirectoryItemIPCReponse,
  DirectoryItemType,
  ExtractBasePathFromDirectoryItem,
  NewFolderArgs,
  OpenDirectoryArgs,
  OpenDirectoryReplyData,
  RenameAndMoveArgs
} from '../../types/types'

export function registerDirectoryHandlers(): void {
  ipcMain.on(IPC_CHANNELS.DIRECTORY.OPEN, handleOpenDirectory)
  ipcMain.on(IPC_CHANNELS.DIRECTORY.NEW_FOLDER, handleNewFolder)
  ipcMain.on(IPC_CHANNELS.DIRECTORY.DELETE_FOLDER, handleDeleteFolder)
  ipcMain.on(IPC_CHANNELS.DIRECTORY.RENAME_OR_MOVE, handleRenameAndMove)
}

async function handleRenameAndMove(event: IpcMainEvent, args: RenameAndMoveArgs): Promise<void> {
  const sourcePath = args.sourcePath
  const destinationPath = args.destinationPath

  try {
    fs.renameSync(sourcePath, destinationPath)
    event.reply(IPC_CHANNELS.DIRECTORY.RENAME_OR_MOVE, DirectoryItemIPCReponse.SUCCESS)
  } catch (error) {
    event.reply(IPC_CHANNELS.DIRECTORY.RENAME_OR_MOVE, DirectoryItemIPCReponse.UNKNOWN_ERROR)
  }
}

async function handleNewFolder(event: IpcMainEvent, args: NewFolderArgs): Promise<void> {
  const folderPath = args.basePath
  const folderName = args.name

  const fullPath = join(folderPath, folderName)

  fs.mkdirSync(fullPath, { recursive: true })
  event.reply(IPC_CHANNELS.DIRECTORY.NEW_FOLDER, DirectoryItemIPCReponse.SUCCESS)
}

async function handleDeleteFolder(event: IpcMainEvent, path: string): Promise<void> {
  try {
    fs.rmdirSync(path, { recursive: true })
    event.reply(IPC_CHANNELS.DIRECTORY.DELETE_FOLDER, DirectoryItemIPCReponse.SUCCESS)
  } catch (error) {
    event.reply(IPC_CHANNELS.DIRECTORY.DELETE_FOLDER, DirectoryItemIPCReponse.UNKNOWN_ERROR)
  }
}

async function handleOpenDirectory(
  event: IpcMainEvent,
  folderPathArg: OpenDirectoryArgs
): Promise<void> {
  let folderPath = folderPathArg.path
  // if no folderpath then open dialog
  if (!folderPath || folderPath.trim() === '') {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory', 'promptToCreate', 'showHiddenFiles']
    })
    folderPath = result.filePaths[0]
  }

  const folder = folderPath.toString()

  // Get folder structure for templates directory
  const directoryItems = getDirectoryStructure(folder)

  event.reply(IPC_CHANNELS.DIRECTORY.OPEN_REPLY, {
    directoryItems,
    type: folderPathArg.type,
    basePath: folder.replace(/\\/g, '/')
  } as OpenDirectoryReplyData)
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
    const base = ExtractBasePathFromDirectoryItem(itemFullPathForwardSlash, type)
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
