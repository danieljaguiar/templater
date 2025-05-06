import { DirectoryItem } from '@types'
import React from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

export default function RenameDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename: (name: string) => void
  item: DirectoryItem | undefined
}) {
  if (!props.item) {
    return null
  }

  const [newName, setNewName] = React.useState<string>(props.item.name)
  const handleRename = () => {
    if (props.item) {
      props.onRename(newName)
      setNewName('')
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
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
