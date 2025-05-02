import useDatasetDirectoryStore from '@/stores/datasetDirectoryStore'
import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { FieldInUse } from '../../../types/types'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function DatasetPicker() {
  const dataTree = useDatasetDirectoryStore((state) => state.datasetDirectory.datasetDirectory)
  const { setFields, setFileInfo } = useDatasetStore()

  return (
    <ScrollArea>
      <TreeViewV0
        directoryItems={dataTree}
        onFileOpened={async (selectedFile) => {
          const newData = JSON.parse(selectedFile.content || '') as FieldInUse[]
          setFileInfo(selectedFile)
          setFields(newData)
        }}
      />
    </ScrollArea>
  )
}
