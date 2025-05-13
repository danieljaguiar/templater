export const IPC_CHANNELS = {
  RENDERER: {
    READY: 'renderer-ready'
  },
  UPDATE: {
    GET_CURRENT_VERSION: 'get-current-version',
    INSTALL_NOW: 'install-now',
    UPDATE_AVAILABLE: 'update-available'
  },
  DIRECTORY: {
    NEW_FOLDER: 'new-folder',
    DELETE_FOLDER: 'delete-folder',
    RENAME_OR_MOVE: 'move-item',
    OPEN: 'open-folder',
    OPEN_REPLY: 'open-folder-reply'
  },
  FILE: {
    OPEN: 'open-file',
    SAVE: 'save-file',
    DELETE: 'delete-file'
  },
  SETTINGS: {
    GET: 'get-settings',
    SET: 'set-settings'
  }
}
