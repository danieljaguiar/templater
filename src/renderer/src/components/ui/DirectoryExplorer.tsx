import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ContextMenuLabel } from '@radix-ui/react-context-menu'
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, RefreshCw } from 'lucide-react'
import * as React from 'react'
import {
  BaseDirectoryItem,
  DirectoryItem,
  DirectoryItemIPCReponse,
  DirectoryItemType,
  DirectoryType,
  GetFullPathFromBaseDirectoryItemInfo,
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
  onRename?: (item: DirectoryItem) => void
  onNewFolder?: (item: DirectoryItem) => void
}

export function DirectoryExplorerItem(props: TreeItemProps) {
  const [expanded, setExpanded] = React.useState(props.level === 0 ? true : false)
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

  const handleNewFolder = () => {
    if (props.onNewFolder) {
      props.onNewFolder(props.item)
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
              handleNewFolder()
            }}
          >
            New Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {expanded && hasChildren && (
        <div>
          {props.item.children?.map((child) => (
            <DirectoryExplorerItem
              key={child.fullPath}
              {...props}
              item={child}
              level={props.level || 0 + 1}
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
  onFolderDeleted?: (item: BaseDirectoryItem) => void
}

export function DirectoryExplorer({
  className,
  directoryType,
  onFileOpened,
  onFileDeleted,
  onFolderDeleted,
  onFileEdited
}: DirectoryExplorerProps) {
  const storageKey = `directory-explorer-${directoryType}`
  const [basePath, setBasePath] = useLocalStorage<string>(storageKey, '')
  const [directoryItems, setDirectoryItems] = React.useState<DirectoryItem[] | undefined>(undefined)
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [itemToMoveSource, setItemToMoveSource] = React.useState<DirectoryItem | undefined>(
    undefined
  )
  const [itemToRename, setItemToRename] = React.useState<DirectoryItem | undefined>(undefined)
  const [newFolderBasePath, setNewFolderBasePath] = React.useState<string>('')

  const selectHandler = async (dirItem: DirectoryItem) => {
    setSelectedId(dirItem.fullPath)
    if (onFileOpened && dirItem.type === 'file') {
      const fileInfo = await window.electronAPI.openFile({
        fullPath: GetFullPathFromBaseDirectoryItemInfo(dirItem)
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

  const newFolderHandler = (dirItem: DirectoryItem) => {
    const path = dirItem.type === DirectoryItemType.FILE ? dirItem.basePath : dirItem.fullPath
    setNewFolderBasePath(path)
  }

  const deleteHandler = async (dirItem: DirectoryItem) => {
    const fullPath = GetFullPathFromBaseDirectoryItemInfo(dirItem)

    const res =
      dirItem.type === DirectoryItemType.FILE
        ? await window.electronAPI.deleteFile({ fullPath })
        : await window.electronAPI.deleteFolder(fullPath)
    if (res === DirectoryItemIPCReponse.SUCCESS) {
      if (dirItem.type === DirectoryItemType.FILE && onFileDeleted) onFileDeleted(dirItem)
      if (dirItem.type === DirectoryItemType.FOLDER && onFolderDeleted) onFolderDeleted(dirItem)
      reloadTemplateDirectoryHandler()
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
    window.electronAPI.openDirectory({
      type: directoryType,
      path: basePath
    })
  }

  const renameItemHandler = (item: DirectoryItem) => {
    setItemToRename(item)
  }

  const processItemRename = async (name: string) => {
    if (itemToRename) {
      const newPath =
        itemToRename.type === DirectoryItemType.FILE
          ? `${itemToRename.basePath}/${name}${itemToRename.extension && itemToRename.extension !== '' ? '.' + itemToRename.extension : ''}`
          : `${itemToRename.basePath}/${name}`

      const res = await window.electronAPI.renameOrMoveItem({
        sourcePath: itemToRename.fullPath,
        destinationPath: newPath
      })
      if (res === DirectoryItemIPCReponse.SUCCESS) {
        toast({
          title: 'Success',
          description: `${itemToRename.name} renamed to ${name} successfully.`,
          variant: 'default'
        })
        reloadTemplateDirectoryHandler()
      } else {
        toast({
          title: 'Error',
          description: `Failed to rename ${itemToRename.name}.`,
          variant: 'destructive'
        })
      }
    }
    setItemToRename(undefined)
  }

  const moveItemHandler = async (item: DirectoryItem) => {
    setItemToMoveSource(item)
  }

  const processItemMove = async (itemDestination) => {
    if (itemToMoveSource) {
      const sourcePath = itemToMoveSource.fullPath
      const destinationPath = itemDestination.fullPath
      if (sourcePath === destinationPath) {
        toast({
          title: 'Error',
          description: `Cannot move ${itemToMoveSource.name} to the same location.`,
          variant: 'destructive'
        })
        return
      }
      const res = await window.electronAPI.renameOrMoveItem({
        sourcePath,
        destinationPath: `${destinationPath}/${itemToMoveSource.name}`
      })
      if (res === DirectoryItemIPCReponse.SUCCESS) {
        toast({
          title: 'Success',
          description: `${itemToMoveSource.name} moved successfully.`,
          variant: 'default'
        })
        reloadTemplateDirectoryHandler()
      } else {
        toast({
          title: 'Error',
          description: `Failed to move ${itemToMoveSource.name}.`,
          variant: 'destructive'
        })
      }
    }
    setItemToMoveSource(undefined)
  }

  const reloadTemplateDirectoryHandler = (): void => {
    if (basePath === '') return
    window.electronAPI.openDirectory({
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

    window.electronAPI.onOpenDirectory(handleOpenDirectory)

    return () => {}
  }, [])

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
            open={itemToMoveSource !== undefined}
            onOpenChange={(open) => {
              if (!open) {
                setItemToMoveSource(undefined)
              }
            }}
            directoryItems={directoryItems}
            onSelect={processItemMove}
          />

          <RenameDialog
            open={itemToRename !== undefined}
            onOpenChange={(open) => {
              if (!open) {
                setItemToRename(undefined)
              }
            }}
            item={itemToRename}
            onRename={processItemRename}
          />

          <NewFolderNameDialog
            open={newFolderBasePath !== ''}
            onOpenChange={(open) => {
              if (!open) {
                setNewFolderBasePath('')
              }
            }}
            onCreate={async (name) => {
              const res = await window.electronAPI.newFolder({
                basePath: newFolderBasePath,
                name
              })
              if (res === DirectoryItemIPCReponse.SUCCESS) {
                setNewFolderBasePath('')
                toast({
                  title: 'Success',
                  description: `Folder ${name} created successfully.`,
                  variant: 'default'
                })
                reloadTemplateDirectoryHandler()
              } else {
                toast({
                  title: 'Error',
                  description: `Failed to create folder ${name}.`,
                  variant: 'destructive'
                })
              }
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
              onNewFolder={newFolderHandler}
              onMove={moveItemHandler}
              onRename={renameItemHandler}
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
  const rootDirectory: DirectoryItem[] = [
    {
      basePath: props.directoryItems[0].basePath,
      name: 'Root',
      fullPath: props.directoryItems[0].basePath,
      type: DirectoryItemType.FOLDER,
      children: props.directoryItems
    }
  ]
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
          {rootDirectory.map((item) => (
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

function NewFolderNameDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
}) {
  const [folderName, setFolderName] = React.useState<string>('')
  const handleCreate = () => {
    props.onCreate(folderName)
    setFolderName('')
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger>New Folder</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
          <DialogDescription>Enter the name of the new folder.</DialogDescription>
        </DialogHeader>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
        <Button onClick={handleCreate}>Create</Button>
      </DialogContent>
    </Dialog>
  )
}

function RenameDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename: (name: string) => void
  item: DirectoryItem | undefined
}) {
  const [newName, setNewName] = React.useState<string>('')
  const handleRename = () => {
    if (props.item) {
      props.onRename(newName)
      setNewName('')
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger>Rename</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {props.item?.name}</DialogTitle>
          <DialogDescription>Enter the new name for the item.</DialogDescription>
        </DialogHeader>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
        <Button onClick={handleRename}>Rename</Button>
      </DialogContent>
    </Dialog>
  )
}
