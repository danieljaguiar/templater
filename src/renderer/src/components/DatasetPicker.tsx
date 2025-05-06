import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { BaseDirectoryItem, DirectoryType, FieldInUse } from '../../../types/types'
import { DirectoryExplorer } from './directoryManager/DirectoryExplorer'

export default function DatasetPicker() {
  const { setFields, setFileInfo, fileInfo } = useDatasetStore()

  const handleFileSelected = async (selectedFile: BaseDirectoryItem) => {
    const newData = JSON.parse(selectedFile.content || '') as FieldInUse[]
    setFileInfo(selectedFile)
    setFields(newData)
  }

  const handleFileRemoved = async (removedFile: BaseDirectoryItem) => {
    if (
      fileInfo &&
      fileInfo.name === removedFile.name &&
      fileInfo.basePath === removedFile.basePath
    ) {
      setFileInfo(null)
      setFields([])
    }
  }

  return (
    <ScrollArea>
      <DirectoryExplorer
        directoryType={DirectoryType.DATASET}
        onFileOpened={handleFileSelected}
        onFileCreated={handleFileSelected}
        onFileDeleted={handleFileRemoved}
      />
    </ScrollArea>
  )
}
