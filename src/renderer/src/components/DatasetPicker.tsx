import useDatasetDirectoryStore from '@/stores/datasetDirectoryStore'
import useDatasetStore from '@/stores/datasetStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { FieldInUse, GetFullPathFromBaseFileFolderInfo } from '../../../types/types'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function DatasetPicker() {
  const dataTree = useDatasetDirectoryStore((state) => state.datasetDirectory.datasetDirectory)
  const { fields: data, setFields: setData, setFileInfo } = useDatasetStore()

  return (
    <div>
      <ScrollArea>
        <TreeViewV0
          data={dataTree}
          onSelectFile={async (fileFromTree) => {
            const fileInfo = await window.electronAPI.openFile({
              fullPath: GetFullPathFromBaseFileFolderInfo(fileFromTree)
            })
            if (fileInfo) {
              if (fileInfo.content === null || fileInfo.content === undefined) {
                console.error('File content is null.')
                return
              }

              let newData = JSON.parse(fileInfo.content) as FieldInUse[]

              newData = newData.map((item) => {
                const existingItem = data.find((d) => d.name === item.name)
                if (existingItem) {
                  return { ...item, inTemplate: existingItem.inTemplate, inDisk: true }
                } else {
                  return { ...item, inTemplate: false, inDisk: true }
                }
              })
              setFileInfo(fileInfo)
              setData(newData)
            } else {
              console.error('File not found or could not be opened.')
            }
          }}
        />
      </ScrollArea>
    </div>
  )
}
