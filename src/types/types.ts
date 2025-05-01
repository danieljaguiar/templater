export interface DataInStore {
  name: string
  value: string
}

export interface DataInUse extends DataInStore {
  inTemplate: boolean
  inDataFile: boolean
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

export interface FileInterface extends BaseDirectoryItem {}

export interface OpenFileArgs {
  fullPath: string
}

export interface OpenFileReplyData {
  file: FileInterface
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
  templateDirectory: DirectoryItem[]
  dataDirectory: DirectoryItem[]
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
