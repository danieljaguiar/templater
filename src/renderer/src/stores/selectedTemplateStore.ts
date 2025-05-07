import { BaseDirectoryItem } from '@types'
import { create } from 'zustand'
import useDatasetStore from './datasetStore'

interface SelectedTempalteStore {
  selectedTemplate: BaseDirectoryItem | null
  placeholders: string[]
  setSelectedTemplate: (template: BaseDirectoryItem | null) => void
  resetSelectedTemplate: () => void
}

const useSelectedTemplateStore = create<SelectedTempalteStore>((set) => ({
  selectedTemplate: null,
  placeholders: [],
  setSelectedTemplate: (template: BaseDirectoryItem | null) => {
    if (!template) {
      set({ selectedTemplate: null, placeholders: [] })
      return
    }

    if (template.content === null || template.content === undefined || template.content === '') {
      set({ selectedTemplate: template, placeholders: [] })
      return
    }

    // Regex to find placeholders: @@name but not \@@name (escaped), remove @@ from the match
    let placeholders: string[] = []
    const placeholderRegex = template.content.match(/(?<!@)@@([a-zA-Z0-9_]+)/g)
    if (placeholderRegex) {
      placeholders = placeholderRegex.map((placeholder) => placeholder.replace('@@', ''))
    }
    // Remove duplicates
    placeholders = [...new Set(placeholders)]
    // Remove empty strings
    placeholders = placeholders.filter((placeholder) => placeholder.trim() !== '')

    const { mergePlaceholdersToFields } = useDatasetStore.getState()
    mergePlaceholdersToFields(placeholders)

    set({
      selectedTemplate: { ...template, content: template.content },
      placeholders: placeholders
    })
  },
  resetSelectedTemplate: () => set({ selectedTemplate: null })
}))

export default useSelectedTemplateStore
