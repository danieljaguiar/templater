import { ipcMain, IpcMainEvent } from 'electron'
import fs from 'fs'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  BaseDirectoryItem,
  DirectoryItemSavingStatus,
  DirectoryItemType,
  ExtractBasePathFromDirectoryItem,
  FileToSave,
  GetFullPathFromBaseDirectoryItemInfo,
  OpenFileArgs
} from '../../types/types'

export function registerFileHandlers(): void {
  ipcMain.on(IPC_CHANNELS.FILE.OPEN, handleOpenFile)
  ipcMain.on(IPC_CHANNELS.FILE.SAVE, handeSaveFile)
  ipcMain.on(IPC_CHANNELS.FILE.DELETE, handleDeleteFile)
}

async function handleOpenFile(event: IpcMainEvent, args: OpenFileArgs): Promise<void> {
  const fileContent = fs.readFileSync(args.fullPath, 'utf-8')
  const baseFile = ExtractBasePathFromDirectoryItem(args.fullPath, DirectoryItemType.FILE)

  const file: BaseDirectoryItem = {
    ...baseFile,
    content: fileContent
  }
  event.reply(IPC_CHANNELS.FILE.OPEN, file)
}

async function handleDeleteFile(event: IpcMainEvent, args: OpenFileArgs): Promise<void> {
  const filePath = args.fullPath
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    event.reply(IPC_CHANNELS.FILE.DELETE, DirectoryItemSavingStatus.SUCCESS)
  } else {
    event.reply(IPC_CHANNELS.FILE.DELETE, DirectoryItemSavingStatus.UNKNOWN_ERROR)
  }
}

async function handeSaveFile(event: IpcMainEvent, fileInfo: FileToSave): Promise<void> {
  if (!fileInfo || !fileInfo.basePath || !fileInfo.type || !fileInfo.content) {
    console.error('Invalid file information provided:', fileInfo)
    event.reply(IPC_CHANNELS.FILE.SAVE, DirectoryItemSavingStatus.UNKNOWN_ERROR)
    return
  }

  try {
    let fullFilePath = ''

    if (fileInfo.name === '' && fileInfo.newFileName) {
      // File name is empty, save as new file
      // Check if the new file name already exists
      fullFilePath = GetFullPathFromBaseDirectoryItemInfo({
        ...fileInfo,
        name: fileInfo.newFileName
      })
      if (fs.existsSync(fullFilePath)) {
        // File already exists, return conflict status
        event.reply(IPC_CHANNELS.FILE.SAVE, DirectoryItemSavingStatus.CONFLICT)
        return
      }
    } else if ((!fileInfo.newFileName || fileInfo.newFileName === '') && fileInfo.name) {
      // No new file name provided, use the existing name
      fullFilePath = GetFullPathFromBaseDirectoryItemInfo(fileInfo)
    } else if (fileInfo.name && fileInfo.newFileName) {
      // File name is provided, save as new file with the new name
      fullFilePath = GetFullPathFromBaseDirectoryItemInfo({
        ...fileInfo,
        name: fileInfo.newFileName
      })
      // Check if the new file name already exists
      if (fs.existsSync(fullFilePath)) {
        // File already exists, return conflict status
        event.reply(IPC_CHANNELS.FILE.SAVE, DirectoryItemSavingStatus.CONFLICT)
        return
      }

      // Delete the old file if it exists and is different from the new path
      const oldFilePath = GetFullPathFromBaseDirectoryItemInfo(fileInfo)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    } else {
      // fail
      console.error('File name is empty and no new file name provided.')
      event.reply(IPC_CHANNELS.FILE.SAVE, DirectoryItemSavingStatus.UNKNOWN_ERROR)
    }

    // Save the file content
    fs.writeFileSync(fullFilePath, fileInfo.content, 'utf-8')
    event.reply(IPC_CHANNELS.FILE.SAVE, DirectoryItemSavingStatus.SUCCESS)
  } catch (error) {
    console.error('Error saving file:', error)
    event.reply(IPC_CHANNELS.FILE.SAVE, DirectoryItemSavingStatus.UNKNOWN_ERROR)
  }
}
