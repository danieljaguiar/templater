import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ContextMenuLabel } from '@radix-ui/react-context-menu'
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, RefreshCw } from 'lucide-react'
import * as React from 'react'
import {
  BaseDirectoryItem,
  DirectoryItem,
  DirectoryItemType,
  DirectoryType,
  FileSavingStatus,
  GetFullPathFromBaseFileFolderInfo,
  OpenDirectoryReplyData
} from '../../../../types/types'
import { Button } from './button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from './context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog'

interface TreeItemProps {
  item: DirectoryItem
  hideContextMenu?: boolean
  discardType?: DirectoryItemType
  selectedId?: string
  level?: number
  onSelect?: (item: DirectoryItem) => void
  onDelete?: (item: DirectoryItem) => void
  onMove?: (item: DirectoryItem) => void
}

export function DirectoryExplorerItem(props: TreeItemProps) {
  console.log('DirectoryExplorerItem', props.level, props.item.name)
  const [expanded, setExpanded] = React.useState(false)
  const isFolder = props.item.type === DirectoryItemType.FOLDER
  const hasChildren = isFolder && props.item.children && props.item.children.length > 0
  const isSelected = props.selectedId === GetFullPathFromBaseFileFolderInfo(props.item)

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
              if (props.onDelete) {
                props.onDelete(props.item)
              }
            }}
          >
            Delete {props.item.type === DirectoryItemType.FILE ? 'File' : 'Folder'}
          </ContextMenuItem>
          <ContextMenuItem inset>New Folder</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {expanded && hasChildren && (
        <div>
          {props.item.children?.map((child) => (
            <DirectoryExplorerItem
              key={child.fullPath}
              item={child}
              level={props.level || 0 + 1}
              onSelect={props.onSelect}
              selectedId={props.selectedId}
              onDelete={props.onDelete}
              discardType={props.discardType}
            />
          ))}
        </div>
      )}
    </>
  )
}

interface DirectoryExplorerProps {
  className?: string
  directoryType: DirectoryType
  onFileOpened?: (item: BaseDirectoryItem) => void
  onFileDeleted?: (item: BaseDirectoryItem) => void
  onFileEdited?: (item: BaseDirectoryItem) => void
}

export function DirectoryExplorer({
  className,
  directoryType,
  onFileOpened,
  onFileDeleted,
  onFileEdited
}: DirectoryExplorerProps) {
  const storageKey = `directory-explorer-${directoryType}`
  const [basePath, setBasePath] = useLocalStorage<string>(storageKey, '')
  const [directoryItems, setDirectoryItems] = React.useState<DirectoryItem[] | undefined>(undefined)
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [itemToMoveSource, setItemToMoveSource] = React.useState<DirectoryItem | undefined>(
    undefined
  )
  const [itemToMoveTarget, setItemToMoveTarget] = React.useState<DirectoryItem | undefined>(
    undefined
  )

  const selectHandler = async (dirItem: DirectoryItem) => {
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

  const deleteHandler = async (dirItem: DirectoryItem) => {
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

  const openFolderHandler = (): void => {
    window.electronAPI.openFolder({
      type: directoryType,
      path: basePath
    })
  }

  React.useEffect(() => {
    const handleOpenDirectory = async (res: OpenDirectoryReplyData) => {
      if (!res) return

      if (res.type !== directoryType) {
        return
      }
      setDirectoryItems(res.directoryItems)
      setBasePath(res.basePath)
    }

    window.electronAPI.onOpenFolder(handleOpenDirectory)

    return () => {}
  }, [])

  const moveItemHandler = async (item: DirectoryItem) => {
    setItemToMoveSource(item)
  }

  const reloadTemplateDirectoryHandler = (): void => {
    if (basePath === '') return
    window.electronAPI.openFolder({
      type: directoryType,
      path: basePath
    })
  }

  React.useEffect(() => {
    reloadTemplateDirectoryHandler()
  }, [])

  return (
    <div className={cn('', className)}>
      <div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={openFolderHandler} title="Open Folder">
            <FolderOpen className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={reloadTemplateDirectoryHandler}
            disabled={!basePath}
            title="Reload"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {!directoryItems ? (
        <div className="flex items-center justify-center h-full text-muted-foreground/70 italic">
          Please open a directory to view its contents.
        </div>
      ) : (
        <>
          <FolderSelector
            open={!!itemToMoveSource}
            onOpenChange={(open) => {
              if (!open) {
                setItemToMoveSource(undefined)
              }
            }}
            directoryItems={directoryItems}
            onSelect={(item) => {
              // if (itemToMoveSource && itemToMoveTarget) {
              //   window.electronAPI.moveFile({
              //     source: itemToMoveSource,
              //     target: itemToMoveTarget
              //   })
              // }
              setItemToMoveSource(undefined)
            }}
          />

          {/* Main tree */}
          {directoryItems.map((item) => (
            <DirectoryExplorerItem
              key={item.fullPath}
              item={item}
              selectedId={selectedId}
              onSelect={selectHandler}
              onDelete={deleteHandler}
              onMove={moveItemHandler}
            />
          ))}
        </>
      )}
    </div>
  )
}

interface FolderSelectorProps {
  className?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  directoryItems: DirectoryItem[]
  onSelect: (item: DirectoryItem) => void
}

export function FolderSelector(props: FolderSelectorProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className={cn('flex flex-col space-y-2', props.className)}>
          {props.directoryItems.map((item) => (
            <DirectoryExplorerItem
              key={item.fullPath}
              item={item}
              hideContextMenu={true}
              onSelect={props.onSelect}
              discardType={DirectoryItemType.FILE}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
