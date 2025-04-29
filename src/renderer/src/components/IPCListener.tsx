import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { useEffect } from 'react'
import { FileInterface, OnOpenFolderReturn } from 'src/types/types'

export default function IPCListener() {
  const selectedTemplateStore = useSelectedTemplateStore((state) => state)
  const templateDirectoryStore = useTemplateDirectoryStore((state) => state)

  useEffect(() => {
    // Directory Opened Listener
    const handleDirectoryOpened = (data: OnOpenFolderReturn): void => {
      console.log('Received directory data:', data)
      if (data !== null) {
        templateDirectoryStore.setTemplateDirectory(data.templateDirectory, data.basePath)
      }
    }
    window.electronAPI.onFolderOpened(handleDirectoryOpened)
    if (window && window.electronAPI && templateDirectoryStore.templateDirectory.basePath !== '') {
      console.log('Initial Load - Refreshing Directory')
      window.electronAPI.openFolder(templateDirectoryStore.templateDirectory.basePath)
    }

    // File Opened Listener
    const handleFileOpened = (data: FileInterface): void => {
      console.log('Received file data:', data)
      if (data !== null) {
        selectedTemplateStore.setSelectedTemplate(data)
      }
    }
    window.electronAPI.onFileOpened(handleFileOpened)

    return () => {
      window.electronAPI.removeOnOpenFileListener()
      window.electronAPI.removeOnOpenFolderListener()
    }
  }, []) // Empty dependency array means this runs once on mount

  return null
}
