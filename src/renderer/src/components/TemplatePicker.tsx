import useDatasetStore from '@/stores/datasetStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { GetFullPathFromBaseFileFolderInfo } from '../../../types/types'
import { ScrollArea } from './ui/scroll-area'
import { TreeViewV0 } from './ui/tree-viewV0'

export default function TemplatePicker() {
  const templateTree = useTemplateDirectoryStore(
    (state) => state.templateDirectory.templateDirectory
  )
  const resetDataTemplateInUse = useDatasetStore(
    (state) => state.removeFieldsNotInUseAndResetTemplateFlag
  )
  const setSelectedTemplate = useSelectedTemplateStore((state) => state.setSelectedTemplate)

  return (
    <ScrollArea className="h-full">
      <TreeViewV0
        directoryItems={templateTree}
        onSelectFile={async (fileFromTree) => {
          resetDataTemplateInUse()
          const fileInfo = await window.electronAPI.openFile({
            fullPath: GetFullPathFromBaseFileFolderInfo(fileFromTree)
          })
          if (fileInfo) {
            setSelectedTemplate(fileInfo)
          } else {
            console.error('File not found or could not be opened.')
          }
        }}
      />
    </ScrollArea>
  )
}
