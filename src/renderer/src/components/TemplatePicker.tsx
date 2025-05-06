import useDatasetStore from '@/stores/datasetStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { DirectoryType } from '../../../types/types'
import { DirectoryExplorer } from './directoryManager/DirectoryExplorer'
import { ScrollArea } from './ui/scroll-area'

export default function TemplatePicker() {
  const resetDataTemplateInUse = useDatasetStore(
    (state) => state.removeFieldsNotInUseAndResetTemplateFlag
  )
  const setSelectedTemplate = useSelectedTemplateStore((state) => state.setSelectedTemplate)

  return (
    <ScrollArea className="h-full">
      <DirectoryExplorer
        directoryType={DirectoryType.TEMPLATE}
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
