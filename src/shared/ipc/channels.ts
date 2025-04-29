export const IPC_CHANNELS = {
  DIRECTORY: {
    OPEN: 'open-folder',
    OPEN_REPLY: 'open-folder-reply',
    GET_STRUCTURE: 'get-directory-structure'
  },
  FILE: {
    OPEN: 'open-file',
    SAVE: 'save-file',
    OPEN_REPLY: 'on-open-file',
    SAVE_REPLY: 'save-file-reply'
  },
  SETTINGS: {
    GET: 'get-settings',
    SET: 'set-settings'
  }
}
