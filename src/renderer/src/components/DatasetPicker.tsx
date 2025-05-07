import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import React from 'react'
import {
  BaseDirectoryItem,
  DirectoryType,
  FieldInUse,
  GetFullPathFromBaseDirectoryItemInfo
} from '../../../types/types'
import { DirectoryExplorer } from './directoryManager/DirectoryExplorer'

export default function DatasetPicker() {
  const { setFields, setFileInfo, fileInfo } = useDatasetStore()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const handleFileSelected = async (selectedFile: BaseDirectoryItem) => {
    const newData = JSON.parse(selectedFile.content || '') as FieldInUse[]
    setFileInfo(selectedFile)
    setFields(newData)
    const fullPath = GetFullPathFromBaseDirectoryItemInfo(selectedFile)
    setSelectedId(fullPath)
  }

  const handleFileRemoved = async (removedFile: BaseDirectoryItem) => {
    if (
      fileInfo &&
      fileInfo.name === removedFile.name &&
      fileInfo.basePath === removedFile.basePath
    ) {
      setFileInfo(null)
      setFields([])
      setSelectedId(null)
    }
  }

  React.useEffect(() => {
    if (!fileInfo) {
      setSelectedId(null)
    }
  }, [fileInfo])

  return (
    <ScrollArea>
      <DirectoryExplorer
        selectedId={selectedId}
        onSelect={handleFileSelected}
        directoryType={DirectoryType.DATASET}
        onFileOpened={handleFileSelected}
        onFileCreated={handleFileSelected}
        onFileDeleted={handleFileRemoved}
      />
    </ScrollArea>
  )
}
