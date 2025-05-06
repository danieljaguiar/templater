import { cn } from '@/lib/utils'
import { ContextMenuLabel } from '@radix-ui/react-context-menu'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import * as React from 'react'
import {
  DirectoryItem,
  DirectoryItemType,
  GetFullPathFromBaseDirectoryItemInfo
} from '../../../../types/types'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../ui/context-menu'

interface DirectoryItemProps {
  item: DirectoryItem
  hideContextMenu?: boolean
  discardType?: DirectoryItemType
  selectedId?: string
  level?: number
  onSelect?: (item: DirectoryItem) => void
  onDelete?: (item: DirectoryItem) => void
  onMove?: (item: DirectoryItem) => void
  onRename?: (item: DirectoryItem) => void
  onNewDirectoryItem?: (itemBase: DirectoryItem, newItemType: DirectoryItemType) => void
}

export function DirectoryItemRow(props: DirectoryItemProps) {
  const [expanded, setExpanded] = React.useState(!props.level ? true : false)
  const isFolder = props.item.type === DirectoryItemType.FOLDER
  const hasChildren = isFolder && props.item.children && props.item.children.length > 0
  const isSelected = props.selectedId === GetFullPathFromBaseDirectoryItemInfo(props.item)

  const handleToggle = () => {
    if (isFolder) {
      setExpanded(!expanded)
    }
  }

  const handleSelect = () => {
    if (props.onSelect) {
      props.onSelect(props.item)
    }
  }

  const handleNewDirectoryItem = (type: DirectoryItemType) => {
    if (props.onNewDirectoryItem) {
      props.onNewDirectoryItem(props.item, type)
    }
  }

  const handleDelete = () => {
    if (props.onDelete) {
      props.onDelete(props.item)
    }
  }

  const handleRename = () => {
    if (props.onRename) {
      props.onRename(props.item)
    }
  }

  if (props.discardType && props.item.type === props.discardType) return null

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          onContextMenu={(event) => {
            if (props.hideContextMenu) {
              event.preventDefault()
              return
            }
          }}
        >
          <div
            className={cn(
              'flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted/20 transition-colors',
              isSelected && 'ring-muted/80 dark:bg-accent bg-accent/40 ring-2'
            )}
            style={{ paddingLeft: `${(props.level ? props.level : 0) * 12 + 8}px` }}
            onClick={handleSelect}
          >
            {isFolder && hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggle()
                }}
                className="mr-1 p-1 rounded-sm hover:bg-muted/90"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-7 min-w-7" />
            )}

            {isFolder ? (
              <Folder className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
            ) : (
              <File className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
            )}

            <span className="truncate">{props.item.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuLabel className="text-xs text-muted-foreground/70 italic pl-1">
            {props.item.name}
          </ContextMenuLabel>
          {props.item.type === DirectoryItemType.FILE && (
            <ContextMenuItem
              inset
              onClick={(e) => {
                e.stopPropagation()
                handleSelect()
              }}
            >
              Open
            </ContextMenuItem>
          )}
          <ContextMenuItem
            inset
            onClick={(e) => {
              e.stopPropagation()
              if (props.onMove) {
                props.onMove(props.item)
              }
            }}
          >
            Move
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={(e) => {
              e.stopPropagation()
              if (props.onRename) {
                props.onRename(props.item)
              }
            }}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={(e) => {
              e.stopPropagation()
              if (props.onDelete) {
                props.onDelete(props.item)
              }
            }}
          >
            Delete {props.item.type === DirectoryItemType.FILE ? 'File' : 'Folder'}
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={(e) => {
              e.stopPropagation()
              handleNewDirectoryItem(DirectoryItemType.FILE)
            }}
          >
            New File
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={(e) => {
              e.stopPropagation()
              handleNewDirectoryItem(DirectoryItemType.FOLDER)
            }}
          >
            New Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {expanded && hasChildren && (
        <div>
          {props.item.children?.map((child) => (
            <DirectoryItemRow
              key={child.fullPath}
              {...props}
              item={child}
              level={(props.level ? props.level : 0) + 1}
            />
          ))}
        </div>
      )}
    </>
  )
}
