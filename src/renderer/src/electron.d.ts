import { FileInterface, OpenDirectoryReplyData } from '../../types/types'

interface ElectronAPI {
  openFolder: (path?: string) => void
  onFolderOpened: (callback: (data: OpenDirectoryReplyData) => void) => void
  openFile: (path: string) => void
  onFileOpened: (callback: (data: FileInterface) => void) => void
  saveFile: (path: string, content: string, name?: string) => void
  removeOnOpenFolderListener: () => void
  removeOnOpenFileListener: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
