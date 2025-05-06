import { cn } from '@/lib/utils'
import { DirectoryItem, DirectoryItemType } from '@types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { DirectoryItemRow } from './DirectoryItemRow'

interface FolderSelectorProps {
  className?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  directoryItems: DirectoryItem[]
  onSelect: (item: DirectoryItem) => void
}

export default function FolderSelector(props: FolderSelectorProps) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Folder</DialogTitle>
          <DialogDescription>Select a folder to move the item to.</DialogDescription>
        </DialogHeader>
        <div className={cn('flex flex-col space-y-2', props.className)}>
          {rootDirectory.map((item) => (
            <DirectoryItemRow
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
