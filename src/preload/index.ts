import { FileSaveData } from '@/types/types'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc/channels'

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
      // FOLDER HANDLERS
      openFolder: (path?: string) => ipcRenderer.send(IPC_CHANNELS.DIRECTORY.OPEN, path),
      onFolderOpened: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.DIRECTORY.OPEN_REPLY, (_event, data) => callback(data))
      },

      // FILE HANDLERS
      openFile: (path: string) => ipcRenderer.send(IPC_CHANNELS.FILE.OPEN, path),
      onFileOpened: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.FILE.OPEN_REPLY, (_event, data) => callback(data))
      },
      saveFile: (fileInfo: FileSaveData) => ipcRenderer.send(IPC_CHANNELS.FILE.SAVE, fileInfo),

      // REMOVE LISTENERS
      removeOnOpenFolderListener: () => {
        ipcRenderer.removeAllListeners(IPC_CHANNELS.DIRECTORY.OPEN_REPLY)
      },
      removeOnOpenFileListener: () => {
        ipcRenderer.removeAllListeners(IPC_CHANNELS.FILE.OPEN_REPLY)
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
