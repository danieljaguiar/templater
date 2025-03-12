import { OnOpenFolderReturn } from '../../types/types'

interface ElectronAPI {
  openFolder: () => void
  onFolderOpened: (callback: (data: OnOpenFolderReturn) => void) => void
  removeOpenFolderListener: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: any
    api: any
  }
}

export {}
