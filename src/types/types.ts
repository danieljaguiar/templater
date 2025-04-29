//#region IPC

//#region FILE HANDLERS

export interface FileInterface {
  fullPath: string
  name: string
  type: string
  content: string
}

export interface OpenFileReplyData {
  file: FileInterface
}

export interface FileToSave {
  basePath: string
  content: string
  currentFileName?: string
  newFileName?: string
}

//#endregion

//#region DIRECTORY HANDLERS

export interface DirectoryItem {
  fullPath: string
  name: string
  type: string
  children?: DirectoryItem[]
  checked?: boolean
}

export interface OpenDirectoryReplyData {
  basePath: string
  templateDirectory: DirectoryItem[]
  dataDirectory: DirectoryItem[]
}

//#endregion

//#endregion

//#endregion
