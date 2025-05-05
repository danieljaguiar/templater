export interface Field {
  name: string
  value: string
}

export interface FieldInUse extends Field {
  inTemplate: boolean
  inDisk: boolean
}

export enum DirectoryType {
  TEMPLATE = 'template',
  DATASET = 'dataset'
}

//#region IPC

export enum DirectoryItemType {
  FILE = 'file',
  FOLDER = 'folder'
}

export interface BaseDirectoryItem {
  basePath: string
  name: string
  extension?: string
  content?: string
  type: DirectoryItemType
}

//#region FILE HANDLERS

export enum FileSavingStatus {
  SUCCESS = 'success',
  CONFLICT = 'conflict',
  FILE_NOT_FOUND = 'file-not-found',
  UNKNOWN_ERROR = 'unknown-error'
}

export interface FileToSave extends BaseDirectoryItem {
  newFileName?: string
}

export interface OpenFileArgs {
  fullPath: string
}

export interface OpenFolderArgs {
  path?: string
  type: DirectoryType
}

export interface OpenFileReplyData {
  file: BaseDirectoryItem
}

//#endregion

//#region DIRECTORY HANDLERS

export interface DirectoryItem extends BaseDirectoryItem {
  fullPath: string
  children?: DirectoryItem[]
  checked?: boolean
}

export interface OpenDirectoryReplyData {
  basePath: string
  type: DirectoryType
  directoryItems: DirectoryItem[]
}

//#endregion

//#endregion

//#endregion

export function ExtractBaseFileFolderInfoFromFullPath(
  fullPath: string,
  type: DirectoryItemType
): BaseDirectoryItem {
  const pathParts = fullPath.split('/')
  const nameWithExtension = pathParts.pop() || ''
  const nameParts = nameWithExtension.split('.')
  const extension = nameParts.length > 1 ? nameParts.pop() : undefined
  const name = nameParts.join('.')

  const ret: BaseDirectoryItem = {
    basePath: pathParts.join('/'),
    name,
    extension,
    type
  }
  return ret
}

export function GetFullPathFromBaseFileFolderInfo(baseFileFolder: BaseDirectoryItem): string {
  const { basePath, name, extension } = baseFileFolder
  return `${basePath}/${name}${extension ? '.' + extension : ''}`
}
