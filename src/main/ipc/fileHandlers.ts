import { ipcMain, IpcMainEvent } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import { FileInterface, FileToSave, OpenFileArgs } from '../../types/types'

export function registerFileHandlers(): void {
  ipcMain.on(IPC_CHANNELS.FILE.OPEN, handleOpenFile)
  ipcMain.on(IPC_CHANNELS.FILE.SAVE, handeSaveFile)
}

async function handleOpenFile(event: IpcMainEvent, args: OpenFileArgs): Promise<void> {
  console.log('Opening file:', args.fullPath)
  const fileContent = fs.readFileSync(args.fullPath, 'utf-8')
  const fileName = args.fullPath.split('\\').pop() || 'file.txt'
  const fileType = args.fullPath.split('.').pop() || 'txt'

  const file: FileInterface = {
    name: fileName,
    fullPath: args.fullPath,
    type: fileType,
    content: fileContent,
    role: args.role
  }
  event.reply(IPC_CHANNELS.FILE.OPEN, file)
}

async function handeSaveFile(event: IpcMainEvent, fileInfo: FileToSave): Promise<void> {
  // if currentFileName is empty then save as new file
  // if newFileName is empty then save as current file
  // if currentFileName and newFileName is not empty then save as new file and delete old file

  try {
    let filePath = ''

    if (!fileInfo.currentFileName && fileInfo.newFileName) {
      // Save as new file - show save dialog
      filePath = join(fileInfo.basePath, fileInfo.newFileName)
    } else if (!fileInfo.newFileName && fileInfo.currentFileName) {
      // Save to current file
      filePath = join(fileInfo.basePath, fileInfo.currentFileName)
    } else if (fileInfo.currentFileName && fileInfo.newFileName) {
      filePath = join(fileInfo.basePath, fileInfo.newFileName)
      const oldFilePath = join(fileInfo.basePath, fileInfo.currentFileName)

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
    fs.writeFileSync(filePath, fileInfo.content, 'utf-8')
    console.log('File saved successfully:', filePath)
  } catch (error) {
    console.error('Error saving file:', error)
    event.reply(IPC_CHANNELS.FILE.SAVE, {
      success: false,
      message: `Error saving file: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}
