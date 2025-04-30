import { ipcMain, IpcMainEvent } from 'electron'
import fs from 'fs'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  DirectoryItemType,
  ExtractBaseFileFolderInfoFromFullPath,
  FileInterface,
  FileToSave,
  GetFullPathFromBaseFileFolderInfo,
  OpenFileArgs
} from '../../types/types'

export function registerFileHandlers(): void {
  ipcMain.on(IPC_CHANNELS.FILE.OPEN, handleOpenFile)
  ipcMain.on(IPC_CHANNELS.FILE.SAVE, handeSaveFile)
}

async function handleOpenFile(event: IpcMainEvent, args: OpenFileArgs): Promise<void> {
  console.log('Opening file:', args.fullPath)
  const fileContent = fs.readFileSync(args.fullPath, 'utf-8')
  const baseFile = ExtractBaseFileFolderInfoFromFullPath(args.fullPath, DirectoryItemType.FILE)

  const file: FileInterface = {
    ...baseFile,
    content: fileContent
  }
  event.reply(IPC_CHANNELS.FILE.OPEN, file)
}

async function handeSaveFile(event: IpcMainEvent, fileInfo: FileToSave): Promise<void> {
  if (!fileInfo || !fileInfo.basePath || !fileInfo.type || !fileInfo.content) {
    event.reply(IPC_CHANNELS.FILE.SAVE, {
      success: false,
      message: 'Invalid file information provided'
    })
    return
  }

  try {
    let fullFilePath = ''

    if (!fileInfo.name && fileInfo.newFileName) {
      // Save as new file - show save dialog
      fullFilePath = GetFullPathFromBaseFileFolderInfo({ ...fileInfo, name: fileInfo.newFileName })
    } else if (!fileInfo.newFileName && fileInfo.name) {
      // Save to current file
      fullFilePath = GetFullPathFromBaseFileFolderInfo(fileInfo)
    } else if (fileInfo.name && fileInfo.newFileName) {
      fullFilePath = GetFullPathFromBaseFileFolderInfo({ ...fileInfo, name: fileInfo.newFileName })
      const oldFilePath = GetFullPathFromBaseFileFolderInfo(fileInfo)

      // Delete the old file if it exists and is different from the new path
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    } else {
      // fail
      event.reply(IPC_CHANNELS.FILE.SAVE, {
        success: false,
        message: 'No file name provided'
      })
    }

    // Save the file content
    fs.writeFileSync(fullFilePath, fileInfo.content, 'utf-8')
    console.log('File saved successfully:', fullFilePath)
  } catch (error) {
    console.error('Error saving file:', error)
    event.reply(IPC_CHANNELS.FILE.SAVE, {
      success: false,
      message: `Error saving file: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}
