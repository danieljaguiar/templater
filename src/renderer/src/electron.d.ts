import {
  DirectoryItemIPCReponse,
  FileInterface,
  FileToSave,
  NewFolderArgs,
  OpenDirectoryArgs,
  OpenDirectoryReplyData,
  OpenFileArgs,
  RenameAndMoveArgs
} from '../../types/types'

interface ElectronAPI {
  newFolder: (args: NewFolderArgs) => Promise<DirectoryItemIPCReponse>
  deleteFolder: (path: string) => Promise<DirectoryItemIPCReponse>
  renameOrMoveItem: (args: RenameAndMoveArgs) => Promise<DirectoryItemIPCReponse>
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
