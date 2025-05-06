import {
  DirectoryItemIPCReponse,
  FileInterface,
  FileToSave,
  OpenDirectoryArgs,
  OpenDirectoryReplyData,
  OpenFileArgs
} from '../../types/types'

interface ElectronAPI {
  newFolder: (args: NewFolderArgs) => Promise<DirectoryItemIPCReponse>
  openDirectory: (args: OpenDirectoryArgs) => void
  onOpenDirectory: (callback: (data: OpenDirectoryReplyData) => void) => void
  openFile: (args: OpenFileArgs) => Promise<FileInterface>
  deleteFile: (args: OpenFileArgs) => Promise<DirectoryItemIPCReponse>
  saveFile: (fileInfo: FileToSave) => Promise<DirectoryItemIPCReponse>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
