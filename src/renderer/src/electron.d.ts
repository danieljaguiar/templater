import {
  FileInterface,
  FileSavingStatus,
  FileToSave,
  OpenDirectoryArgs,
  OpenDirectoryReplyData,
  OpenFileArgs
} from '../../types/types'

interface ElectronAPI {
  openDirectory: (args: OpenDirectoryArgs) => void
  onOpenDirectory: (callback: (data: OpenDirectoryReplyData) => void) => void
  openFile: (args: OpenFileArgs) => Promise<FileInterface>
  deleteFile: (args: OpenFileArgs) => Promise<FileSavingStatus>
  saveFile: (fileInfo: FileToSave) => Promise<FileSavingStatus>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
