import useDatasetStore from '@/stores/datasetStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { DirectoryExplorer } from './ui/DirectoryExplorer'
import { ScrollArea } from './ui/scroll-area'

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
      <DirectoryExplorer
        directoryItems={templateTree}
        onFileOpened={async (dirItem) => {
          resetDataTemplateInUse()
          if (dirItem) {
            setSelectedTemplate(dirItem)
          } else {
            console.error('File not found or could not be opened.')
          }
        }}
      />
    </ScrollArea>
  )
}
