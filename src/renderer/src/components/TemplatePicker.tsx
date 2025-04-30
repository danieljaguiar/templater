import useDataStore from '@/stores/dataStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { FileRole } from '../../../types/types'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function TemplatePicker() {
  const templateTree = useTemplateDirectoryStore(
    (state) => state.templateDirectory.templateDirectory
  )
  const resetDataTemplateInUse = useDataStore(
    (state) => state.removeFieldsNotInUseAndResetTemplateFlag
  )

  return (
    <div>
      <ScrollArea>
        <TreeViewV0
          data={templateTree}
          onSelectFile={(fileFromTree) => {
            resetDataTemplateInUse()
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
