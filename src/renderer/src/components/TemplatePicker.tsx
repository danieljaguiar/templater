import useDatasetStore from '@/stores/datasetStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { BaseDirectoryItem, DirectoryType } from '../../../types/types'
import { DirectoryExplorer } from './directoryManager/DirectoryExplorer'
import { ScrollArea } from './ui/scroll-area'

export default function TemplatePicker() {
  const resetDataTemplateInUse = useDatasetStore(
    (state) => state.removeFieldsNotInUseAndResetTemplateFlag
  )

  const { setSelectedTemplate, selectedTemplate } = useSelectedTemplateStore()

  const handleTemplateSelected = async (dirItem: BaseDirectoryItem) => {
    resetDataTemplateInUse()
    if (dirItem) {
      setSelectedTemplate(dirItem)
    } else {
      console.error('File not found or could not be opened.')
    }
  }

  const handleTemplateRemoved = async (removedFile: BaseDirectoryItem) => {
    if (
      selectedTemplate &&
      selectedTemplate.name === removedFile.name &&
      selectedTemplate.basePath === removedFile.basePath
    ) {
      setSelectedTemplate(null)
    }
  }

  return (
    <ScrollArea className="h-full">
      <DirectoryExplorer
        directoryType={DirectoryType.TEMPLATE}
        onFileOpened={handleTemplateSelected}
        onFileDeleted={handleTemplateRemoved}
        onFileCreated={handleTemplateSelected}
      />
    </ScrollArea>
  )
}
