import useDataDirectoryStore from '@/stores/dataDirectoryStore'
import useDataStore from '@/stores/dataStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { DataInUse, GetFullPathFromBaseFileFolderInfo } from '../../../types/types'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function DataPicker() {
  const dataTree = useDataDirectoryStore((state) => state.dataDirectory.dataDirectory)
  const { data, setData, setFileInfo } = useDataStore()

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

              let newData = JSON.parse(fileInfo.content) as DataInUse[]

              newData = newData.map((item) => {
                const existingItem = data.find((d) => d.name === item.name)
                if (existingItem) {
                  return { ...item, inTemplate: existingItem.inTemplate, inDataFile: true }
                } else {
                  return { ...item, inTemplate: false, inDataFile: true }
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
