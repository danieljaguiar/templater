import {
  FileToSave,
  NewFolderArgs,
  OpenDirectoryArgs,
  OpenFileArgs,
  RenameAndMoveArgs
} from '@/types/types'
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
      // UPDATER
      getCurrentVersion: () => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.UPDATE.GET_CURRENT_VERSION)
          ipcRenderer.once(IPC_CHANNELS.UPDATE.GET_CURRENT_VERSION, (_event, version) => {
            resolve(version)
          })
        })
      },
      onUpdateAvailable: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.UPDATE.UPDATE_AVAILABLE, (_event, data) => callback(data))
      },
      installUpdateNow: (now: boolean) => {
        ipcRenderer.send(IPC_CHANNELS.UPDATE.INSTALL_NOW, now)
      },
      // DIRECTORY HANDLERS
      openDirectory: (args: OpenDirectoryArgs) =>
        ipcRenderer.send(IPC_CHANNELS.DIRECTORY.OPEN, args),
      onOpenDirectory: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.DIRECTORY.OPEN_REPLY, (_event, data) => callback(data))
      },
      renameOrMoveItem: (args: RenameAndMoveArgs) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.DIRECTORY.RENAME_OR_MOVE, args)
          ipcRenderer.once(IPC_CHANNELS.DIRECTORY.RENAME_OR_MOVE, (_event, result) => {
            resolve(result)
          })
        })
      },
      newFolder: (args: NewFolderArgs) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.DIRECTORY.NEW_FOLDER, args)
          ipcRenderer.once(IPC_CHANNELS.DIRECTORY.NEW_FOLDER, (_event, result) => {
            resolve(result)
          })
        })
      },
      deleteFolder: (path: string) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.DIRECTORY.DELETE_FOLDER, path)
          ipcRenderer.once(IPC_CHANNELS.DIRECTORY.DELETE_FOLDER, (_event, result) => {
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
      },
      deleteFile: (args: OpenFileArgs) => {
        return new Promise((resolve) => {
          ipcRenderer.send(IPC_CHANNELS.FILE.DELETE, args)
          ipcRenderer.once(IPC_CHANNELS.FILE.DELETE, (_event, result) => {
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
