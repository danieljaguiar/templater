import { CircleArrowUpIcon } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

export default function UpdateIcon() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = React.useState(false)
  const [isBlinking, setIsBlinking] = React.useState(false)

  React.useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true)
    }

    window.electronAPI.onUpdateAvailable(handleUpdateAvailable)

    // Set up the blinking effect every 60 seconds
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)

      // Turn off the blinking after 2 seconds
      setTimeout(() => {
        setIsBlinking(false)
      }, 2000)
    }, 5000)

    return () => {
      clearInterval(blinkInterval)
    }
  }, [])

  const handleUpdateClick = () => {
    window.electronAPI.installUpdateNow(true)
  }

  const handleShowUpdateDialog = () => {
    setShowUpdateDialog(true)
  }

  //   if (!updateAvailable) return null

  return (
    <div>
      <Button
        className={`rounded-full transition-colors duration-300 ${isBlinking ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
        variant={isBlinking ? 'outline' : 'destructive'}
        size={'icon'}
        onClick={handleShowUpdateDialog}
      >
        <CircleArrowUpIcon className="h-5 w-5" />
      </Button>
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Available</DialogTitle>
            <DialogDescription>
              A new version of the app is available. Would you like to update now?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUpdateClick}>
              Update Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
