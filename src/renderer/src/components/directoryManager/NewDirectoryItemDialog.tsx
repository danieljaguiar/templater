import { DirectoryItemType, DirectoryType, NewDirectoryItemArgs } from '@types'
import React from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

export default function NewDirectoryItemDialog(props: {
  open: boolean
  newItemArgs: NewDirectoryItemArgs | null
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
}) {
  if (!props.newItemArgs) {
    return null
  }

  const fileTypeName =
    props.newItemArgs.directoryType === DirectoryType.DATASET ? 'dataset' : 'template'
  const [folderName, setFolderName] = React.useState<string>('')
  const handleCreate = () => {
    props.onCreate(folderName)
    setFolderName('')
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.newItemArgs.type === DirectoryItemType.FOLDER
              ? 'New Folder'
              : `New ${fileTypeName}`}
          </DialogTitle>
          <DialogDescription>
            {props.newItemArgs.type === DirectoryItemType.FOLDER
              ? `Create a new folder in the ${fileTypeName} directory`
              : `Create a new ${fileTypeName} file`}
          </DialogDescription>
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
