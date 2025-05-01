import useDataSetDirectoryStore from '@/stores/dataSetDirectoryStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { useEffect } from 'react'

export default function IPCListener() {
  const templateDirectoryStore = useTemplateDirectoryStore((state) => state)
  const dataDirectoryStore = useDataSetDirectoryStore((state) => state)

  const loadInitialData = async () => {
    if (window && window.electronAPI && templateDirectoryStore.templateDirectory.basePath !== '') {
      const data = await window.electronAPI.openFolderAsync(
        templateDirectoryStore.templateDirectory.basePath
      )
      if (data !== null) {
        templateDirectoryStore.setTemplateDirectory(data.templateDirectory, data.basePath)
        dataDirectoryStore.setDataSetDirectory(data.dataDirectory, data.basePath)
      }
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  return null
}
