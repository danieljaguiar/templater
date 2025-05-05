import {
  FileInterface,
  FileSavingStatus,
  FileToSave,
  OpenDirectoryReplyData,
  OpenFileArgs,
  OpenFolderArgs
} from '../../types/types'

interface ElectronAPI {
  openFolder: (args: OpenFolderArgs) => void
  onOpenFolder: (callback: (data: OpenDirectoryReplyData) => void) => void
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
