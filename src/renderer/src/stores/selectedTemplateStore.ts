import { BaseDirectoryItem } from 'src/types/types'
import { create } from 'zustand'

interface SelectedTempalteStore {
  selectedTemplate: BaseDirectoryItem | null
  setSelectedTemplate: (template: BaseDirectoryItem | null) => void
  resetSelectedTemplate: () => void
}

const useSelectedTemplateStore = create<SelectedTempalteStore>((set) => ({
  selectedTemplate: null,
  setSelectedTemplate: (template: BaseDirectoryItem | null) => set({ selectedTemplate: template }),
  resetSelectedTemplate: () => set({ selectedTemplate: null })
}))

export default useSelectedTemplateStore
