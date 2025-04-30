import { FileToSave, OpenFileArgs } from '@/types/types'
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
      openFolderAsync: (path?: string) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.DIRECTORY.OPEN, path)
          ipcRenderer.once(IPC_CHANNELS.DIRECTORY.OPEN, (_event, result) => {
            resolve(result)
          })
        })
      },

      // FILE HANDLERS
      openFile: (args: OpenFileArgs) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.FILE.OPEN, args)
          ipcRenderer.once(IPC_CHANNELS.FILE.OPEN, (_event, result) => {
            resolve(result)
          })
        })
      },
      saveFile: (fileInfo: FileToSave) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.FILE.SAVE, fileInfo)
          ipcRenderer.once(IPC_CHANNELS.FILE.SAVE, (_event, result) => {
            resolve(result)
          })
        })
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
