import {
  FileInterface,
  FileSavingStatus,
  FileToSave,
  OpenDirectoryReplyData,
  OpenFileArgs
} from '../../types/types'

interface ElectronAPI {
  openFolderAsync: (path?: string) => Promise<OpenDirectoryReplyData>
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
