import { FileInterface, OpenDirectoryReplyData, OpenFileArgs } from '../../types/types'

interface ElectronAPI {
  openFolderAsync: (path?: string) => Promise<OpenDirectoryReplyData>
  openFile: (args: OpenFileArgs) => Promise<FileInterface>
  saveFile: (path: string, content: string, name?: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
