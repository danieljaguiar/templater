import useCurrentTemplateStore from '@/stores/currentTemplateStore'
import { useEffect } from 'react'
import { FileInterface } from 'src/types/types'

export default function IPCListener() {
  const file = useCurrentTemplateStore((state) => state.currentTemplate)
  const setFile = useCurrentTemplateStore((state) => state.setCurrentTemplate)

  useEffect(() => {
    // File Opened Listener
    const handleFileOpened = (data: FileInterface): void => {
      console.log('Received file data:', data)
      if (data !== null) {
        setFile(data)
      }
    }
    window.electronAPI.onFileOpened(handleFileOpened)

    // Clean up the listener when component unmounts
    return () => {
      window.electronAPI.removeOpenFolderListener()
    }
  }, [setFile]) // Empty dependency array means this runs once on mount

  return null
}
