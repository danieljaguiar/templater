import { FileInterface, OnOpenFolderReturn } from '../../types/types'

interface ElectronAPI {
  openFolder: (path?: string) => void
  onFolderOpened: (callback: (data: OnOpenFolderReturn) => void) => void
  openFile: (path: string) => void
  onFileOpened: (callback: (data: FileInterface) => void) => void
  removeOpenFolderListener: () => void
  removeOpenFileListener: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
