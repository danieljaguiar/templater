import React from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

export default function NewDirectoryItemDialog(props: {
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
