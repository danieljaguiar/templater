import useDataDirectoryStore from '@/stores/dataDirectoryStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { useEffect } from 'react'

export default function IPCListener() {
  const templateDirectoryStore = useTemplateDirectoryStore((state) => state)
  const dataDirectoryStore = useDataDirectoryStore((state) => state)

  const loadInitialData = async () => {
    if (window && window.electronAPI && templateDirectoryStore.templateDirectory.basePath !== '') {
      console.log('Initial Load - Refreshing Directory')
      const data = await window.electronAPI.openFolderAsync(
        templateDirectoryStore.templateDirectory.basePath
      )
      if (data !== null) {
        templateDirectoryStore.setTemplateDirectory(data.templateDirectory, data.basePath)
        dataDirectoryStore.setDataDirectory(data.dataDirectory, data.basePath)
      }
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  return null
}
