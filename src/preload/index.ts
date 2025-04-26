import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      // Add method to open folder
      openFolder: () => ipcRenderer.send('OPEN-FOLDER'),

      // Add listener for reply with folder contents
      onFolderOpened: (callback) => {
        ipcRenderer.on('OPEN-FOLDER-REPLY', (_event, data) => callback(data))
      },

      openFile: (path: string) => ipcRenderer.send('open-file', path),

      onFileOpened: (callback) => {
        ipcRenderer.on('on-open-file', (_event, data) => callback(data))
      },

      // If you need to remove the listener later
      removeOpenFolderListener: () => {
        ipcRenderer.removeAllListeners('OPEN-FOLDER-REPLY')
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
