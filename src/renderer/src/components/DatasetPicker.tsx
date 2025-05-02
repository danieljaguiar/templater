import useDatasetDirectoryStore from '@/stores/datasetDirectoryStore'
import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { FieldInUse, GetFullPathFromBaseFileFolderInfo } from '../../../types/types'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function DatasetPicker() {
  const dataTree = useDatasetDirectoryStore((state) => state.datasetDirectory.datasetDirectory)
  const { fields, setFields, setFileInfo } = useDatasetStore()

  return (
    <ScrollArea>
      <TreeViewV0
        directoryItems={dataTree}
        onSelectFile={async (fileFromTree) => {
          const fileInfo = await window.electronAPI.openFile({
            fullPath: GetFullPathFromBaseFileFolderInfo(fileFromTree)
          })
          if (fileInfo) {
            if (fileInfo.content === null || fileInfo.content === undefined) {
              console.error('File content is null.')
              return
            }

            const newData = JSON.parse(fileInfo.content) as FieldInUse[]

            setFileInfo(fileInfo)
            setFields(newData)
          } else {
            console.error('File not found or could not be opened.')
          }
        }}
      />
    </ScrollArea>
  )
}
