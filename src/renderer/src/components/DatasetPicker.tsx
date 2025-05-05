import useDatasetDirectoryStore from '@/stores/datasetDirectoryStore'
import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { FieldInUse } from '../../../types/types'
import { DirectoryExplorer } from './ui/DirectoryExplorer'

export default function DatasetPicker() {
  const { reloadAsync, datasetDirectory } = useDatasetDirectoryStore()
  const { setFields, setFileInfo } = useDatasetStore()

  const handleReload = async () => {
    await reloadAsync()
  }

  return (
    <ScrollArea>
      <DirectoryExplorer
        directoryItems={datasetDirectory.datasetDirectory}
        onFileOpened={async (selectedFile) => {
          const newData = JSON.parse(selectedFile.content || '') as FieldInUse[]
          setFileInfo(selectedFile)
          setFields(newData)
        }}
        onFileDeleted={async () => await handleReload()}
      />
    </ScrollArea>
  )
}
