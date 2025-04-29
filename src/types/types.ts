//#region IPC

//#region FILE HANDLERS

export enum FileRole {
  TEMPLATE = 'template',
  DATA = 'data'
}

export interface FileInterface {
  fullPath: string
  name: string
  type: string
  content: string
  role: FileRole
}

export interface OpenFileArgs {
  fullPath: string
  role: FileRole
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
