import useDataStore from '@/stores/dataStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
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
  const setSelectedTemplate = useSelectedTemplateStore((state) => state.setSelectedTemplate)

  return (
    <div>
      <ScrollArea>
        <TreeViewV0
          data={templateTree}
          onSelectFile={async (fileFromTree) => {
            resetDataTemplateInUse()
            const fileInfo = await window.electronAPI.openFile({
              fullPath: fileFromTree.fullPath,
              role: FileRole.TEMPLATE
            })
            if (fileInfo) {
              setSelectedTemplate(fileInfo)
            } else {
              console.error('File not found or could not be opened.')
            }
          }}
        />
      </ScrollArea>
    </div>
  )
}
