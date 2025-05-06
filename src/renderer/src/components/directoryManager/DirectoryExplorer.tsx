import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  BaseDirectoryItem,
  DirectoryItem,
  DirectoryItemIPCReponse,
  DirectoryItemType,
  DirectoryType,
  GetFullPathFromBaseDirectoryItemInfo,
  NewDirectoryItemArgs,
  OpenDirectoryReplyData
} from '@types'
import { FolderOpen, RefreshCw } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'
import { DirectoryItemRow } from './DirectoryItemRow'
import FolderSelector from './FolderSelectorDialog'
import NewDirectoryItemDialog from './NewDirectoryItemDialog'
import RenameDialog from './RenameDirectoryItemDialog'

interface DirectoryExplorerProps {
  className?: string
  directoryType: DirectoryType
  onFileOpened?: (item: BaseDirectoryItem) => void
  onFileDeleted?: (item: BaseDirectoryItem) => void
  onFileEdited?: (item: BaseDirectoryItem) => void
  onFileCreated?: (item: BaseDirectoryItem) => void
  onFolderDeleted?: (item: BaseDirectoryItem) => void
}

export function DirectoryExplorer({
  className,
  directoryType,
  onFileOpened,
  onFileDeleted,
  onFolderDeleted,
  onFileCreated,
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
  const [newDirectoryItemData, setNewDirectoryItemData] =
    React.useState<NewDirectoryItemArgs | null>(null)

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

  const newDirectoryItemHandler = (dirItem: DirectoryItem, type: DirectoryItemType) => {
    const path = dirItem.type === DirectoryItemType.FILE ? dirItem.basePath : dirItem.fullPath
    setNewDirectoryItemData({
      directoryType,
      basePath: path,
      name: '',
      type
    })
  }

  const processDirectoryItem = async (name) => {
    if (!newDirectoryItemData) return
    if (name === '') {
      toast({
        title: 'Error',
        description: 'Name cannot be empty.',
        variant: 'destructive'
      })
      return
    }
    if (newDirectoryItemData.type === DirectoryItemType.FOLDER) {
      const res = await window.electronAPI.newFolder({
        basePath: newDirectoryItemData.basePath,
        name
      })
      if (res === DirectoryItemIPCReponse.SUCCESS) {
        setNewDirectoryItemData(null)
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
    } else {
      const newFile: BaseDirectoryItem = {
        basePath: newDirectoryItemData.basePath,
        name,
        type: DirectoryItemType.FILE,
        extension: directoryType === DirectoryType.DATASET ? 'json' : 'txt',
        content: directoryType === DirectoryType.DATASET ? '[]' : ''
      }
      const res = await window.electronAPI.saveFile(newFile)
      if (res === DirectoryItemIPCReponse.SUCCESS) {
        setNewDirectoryItemData(null)
        toast({
          title: 'Success',
          description: `File ${name} created successfully.`,
          variant: 'default'
        })
        if (onFileCreated) onFileCreated(newFile)
        reloadTemplateDirectoryHandler()
      } else if (res === DirectoryItemIPCReponse.CONFLICT) {
        toast({
          title: 'Error',
          description: `File ${name} already exists.`,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: `Failed to create file ${name}.`,
          variant: 'destructive'
        })
      }
    }
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

          <NewDirectoryItemDialog
            open={newDirectoryItemData !== null}
            newItemArgs={newDirectoryItemData}
            onOpenChange={(open) => {
              if (!open) {
                setNewDirectoryItemData(null)
              }
            }}
            onCreate={processDirectoryItem}
          />

          {/* Main tree */}
          {directoryItems.map((item) => (
            <DirectoryItemRow
              key={item.fullPath}
              item={item}
              selectedId={selectedId}
              onSelect={selectHandler}
              onDelete={deleteHandler}
              onNewDirectoryItem={newDirectoryItemHandler}
              onMove={moveItemHandler}
              onRename={renameItemHandler}
            />
          ))}
        </>
      )}
    </div>
  )
}
