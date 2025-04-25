import React from 'react'
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
  id: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
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
