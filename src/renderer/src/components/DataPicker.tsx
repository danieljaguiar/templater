import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { FileRole } from '../../../types/types'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function DataPicker() {
  const templateTree = useTemplateDirectoryStore(
    (state) => state.templateDirectory.templateDirectory
  )

  return (
    <div>
      <ScrollArea>
        <TreeViewV0
          data={templateTree}
          onSelectFile={(fileFromTree) => {
            console.log('Selected file:', fileFromTree)
            window.electronAPI.openFile({
              fullPath: fileFromTree.fullPath,
              role: FileRole.TEMPLATE
            })
          }}
        />
      </ScrollArea>
    </div>
  )
}
