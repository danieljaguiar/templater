import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { DirectoryType, FieldInUse } from '../../../types/types'
import { DirectoryExplorer } from './ui/DirectoryExplorer'

export default function DatasetPicker() {
  const { setFields, setFileInfo } = useDatasetStore()

  return (
    <ScrollArea>
      <DirectoryExplorer
        directoryType={DirectoryType.DATASET}
        onFileOpened={async (selectedFile) => {
          const newData = JSON.parse(selectedFile.content || '') as FieldInUse[]
          setFileInfo(selectedFile)
          setFields(newData)
        }}
      />
    </ScrollArea>
  )
}
