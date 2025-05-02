import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ContextMenuLabel } from '@radix-ui/react-context-menu'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import * as React from 'react'
import {
  BaseDirectoryItem,
  DirectoryItem,
  DirectoryItemType,
  FileSavingStatus,
  GetFullPathFromBaseFileFolderInfo
} from '../../../../types/types'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from './context-menu'

interface TreeItemProps {
  item: DirectoryItem
  selectedId?: string
  level?: number
  onSelect?: (item: DirectoryItem) => void
  onDelete?: (item: DirectoryItem) => void
}

export function TreeItem({ item, level = 0, onSelect, selectedId, onDelete }: TreeItemProps) {
  const [expanded, setExpanded] = React.useState(false)
  const isFolder = item.type === DirectoryItemType.FOLDER
  const hasChildren = isFolder && item.children && item.children.length > 0
  const isSelected = selectedId === GetFullPathFromBaseFileFolderInfo(item)

  const handleToggle = () => {
    if (isFolder) {
      setExpanded(!expanded)
    }
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(item)
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted/20 transition-colors',
              isSelected && 'ring-muted/80 dark:bg-accent bg-accent/40 ring-2'
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
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

            <span className="truncate">{item.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuLabel className="text-xs text-muted-foreground/70 italic pl-1">
            {item.name}
          </ContextMenuLabel>
          {item.type === DirectoryItemType.FILE && (
            <ContextMenuItem
              inset
              onClick={() => {
                handleSelect()
              }}
            >
              Open
            </ContextMenuItem>
          )}
          <ContextMenuItem inset>Move</ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={(e) => {
              e.stopPropagation()
              if (onDelete) {
                onDelete(item)
              }
            }}
          >
            Delete {item.type === DirectoryItemType.FILE ? 'File' : 'Folder'}
          </ContextMenuItem>
          <ContextMenuItem inset>New Folder</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {expanded && hasChildren && (
        <div>
          {item.children?.map((child) => (
            <TreeItem
              key={child.fullPath}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </>
  )
}

interface TreeViewProps {
  directoryItems: DirectoryItem[]
  className?: string
  onFileOpened?: (item: BaseDirectoryItem) => void
  onFileDeleted?: (item: BaseDirectoryItem) => void
}

export function TreeViewV0({
  directoryItems,
  className,
  onFileOpened,
  onFileDeleted
}: TreeViewProps) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>()

  const handleSelect = async (dirItem: DirectoryItem) => {
    setSelectedId(dirItem.fullPath)
    if (onFileOpened && dirItem.type === 'file') {
      const fileInfo = await window.electronAPI.openFile({
        fullPath: GetFullPathFromBaseFileFolderInfo(dirItem)
      })
      if (fileInfo) {
        onFileOpened(fileInfo)
      } else {
        toast({
          title: 'Error',
          description: 'File not found or could not be opened.',
          variant: 'destructive'
        })
      }
    }
  }

  const handleDelete = async (dirItem: DirectoryItem) => {
    console.log('🚀 ~ handleDelete ~ dirItem:', dirItem)
    const res = await window.electronAPI.deleteFile({
      fullPath: GetFullPathFromBaseFileFolderInfo(dirItem)
    })
    if (res === FileSavingStatus.SUCCESS) {
      if (onFileDeleted) {
        onFileDeleted(dirItem)
      }
      toast({
        title: 'Success',
        description: `${dirItem.name} deleted successfully.`,
        variant: 'default'
      })
    } else {
      toast({
        title: 'Error',
        description: `Failed to delete ${dirItem.name}.`,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className={cn('', className)}>
      {directoryItems.map((item) => (
        <TreeItem
          key={item.fullPath}
          item={item}
          selectedId={selectedId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
