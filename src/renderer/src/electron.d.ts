import {
  DirectoryItemSavingStatus,
  FileInterface,
  FileToSave,
  OpenDirectoryArgs,
  OpenDirectoryReplyData,
  OpenFileArgs
} from '../../types/types'

interface ElectronAPI {
  newFolder: (args: NewFolderArgs) => Promise<DirectoryItemSavingStatus>
  openDirectory: (args: OpenDirectoryArgs) => void
  onOpenDirectory: (callback: (data: OpenDirectoryReplyData) => void) => void
  openFile: (args: OpenFileArgs) => Promise<FileInterface>
  deleteFile: (args: OpenFileArgs) => Promise<DirectoryItemSavingStatus>
  saveFile: (fileInfo: FileToSave) => Promise<DirectoryItemSavingStatus>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
