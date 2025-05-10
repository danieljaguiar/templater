import useDatasetStore from '@/stores/datasetStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import React from 'react'
import {
  BaseDirectoryItem,
  DirectoryItemType,
  DirectoryType,
  GetFullPathFromBaseDirectoryItemInfo
} from '../../../types/types'
import { DirectoryExplorer } from './directoryManager/DirectoryExplorer'
import { ScrollArea } from './ui/scroll-area'

export default function TemplatePicker() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const resetDataTemplateInUse = useDatasetStore(
    (state) => state.removeFieldsNotInUseAndResetTemplateFlag
  )

  const { setSelectedTemplate, selectedTemplate } = useSelectedTemplateStore()

  const handleTemplateSelected = async (dirItem: BaseDirectoryItem) => {
    if (!dirItem) return
    if (dirItem.type !== DirectoryItemType.FILE) return
    resetDataTemplateInUse()
    if (dirItem) {
      setSelectedTemplate(dirItem)
      const fullPath = GetFullPathFromBaseDirectoryItemInfo(dirItem)
      setSelectedId(fullPath)
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
      setSelectedId(null)
    }
  }

  React.useEffect(() => {
    if (!selectedTemplate) {
      setSelectedId(null)
    }
  }, [selectedTemplate])

  return (
    <ScrollArea className="h-full">
      <DirectoryExplorer
        selectedId={selectedId}
        onSelect={handleTemplateSelected}
        directoryType={DirectoryType.TEMPLATE}
        onFileOpened={handleTemplateSelected}
        onFileDeleted={handleTemplateRemoved}
        onFileCreated={handleTemplateSelected}
      />
    </ScrollArea>
  )
}
