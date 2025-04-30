import useDataDirectoryStore from '@/stores/dataDirectoryStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function DataPicker() {
  const dataTree = useDataDirectoryStore((state) => state.dataDirectory.dataDirectory)

  return (
    <div>
      <ScrollArea>
        <TreeViewV0
          data={dataTree}
          onSelectFile={(fileFromTree) => {
            console.log('Selected file:', fileFromTree)
          }}
        />
      </ScrollArea>
    </div>
  )
}
