import React from 'react'

export enum IPCEvents {
  OPEN_FOLDER = 'open-folder',
  OPEN_FILE = 'open-file',
  ON_OPEN_FILE = 'on-open-file',
  SAVE_FILE = 'save-file',
  CLOSE_FILE = 'close-file',
  DELETE_FILE = 'delete-file',
  RENAME_FILE = 'rename-file',
  CREATE_FILE = 'create-file',
  CREATE_FOLDER = 'create-folder',
  COPY_FILE = 'copy-file',
  CUT_FILE = 'cut-file',
  PASTE_FILE = 'paste-file',
  GET_TEMPLATE_DIRECTORY_STRUCTURE = 'get-template-directory-structure',
  GET_DATA_DIRECTORY_STRUCTURE = 'get-data-directory-structure'
}

export interface OnOpenFileReply {
  file: FileInterface
}

export interface ItemForDirectoryStructure {
  name: string
  children?: ItemForDirectoryStructure[]
}

export interface OnOpenFolderReturn {
  templateDirectory: TreeViewItem[]
  dataDirectory: TreeViewItem[]
  basePath: string
}

//#region Tree Component

export interface TreeViewItem {
  path: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
}

export interface FileInterface {
  name: string
  path: string
  type: string
  content: string
}

export interface TreeViewProps {
  className?: string
  data: TreeViewItem[]
  title?: string
  showExpandAll?: boolean
  showCheckboxes?: boolean
  searchPlaceholder?: string
  iconMap?: Record<string, React.ReactNode>
  menuItems?: TreeViewMenuItem[]
  onCheckChange?: (item: TreeViewItem, checked: boolean) => void
  onAction?: (action: string, items: TreeViewItem[]) => void
}

export interface TreeViewMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  action: (items: TreeViewItem[]) => void
}

//#endregion
