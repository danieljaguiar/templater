import { FileInterface } from 'src/types/types'
import { create } from 'zustand'

interface SelectedTempalteStore {
  selectedTemplate: FileInterface | null
  setSelectedTemplate: (template: FileInterface | null) => void
  resetSelectedTemplate: () => void
}

const useSelectedTemplateStore = create<SelectedTempalteStore>((set) => ({
  selectedTemplate: null,
  setSelectedTemplate: (template: FileInterface | null) => set({ selectedTemplate: template }),
  resetSelectedTemplate: () => set({ selectedTemplate: null })
}))

export default useSelectedTemplateStore
