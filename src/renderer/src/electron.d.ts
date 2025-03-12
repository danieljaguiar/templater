interface ElectronAPI {
  openFolder: () => void
  onFolderOpened: (callback: (data: any) => void) => void
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
