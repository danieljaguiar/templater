import { FileInterface } from 'src/types/types'
import { create } from 'zustand'

interface CurrentTemplateStore {
  currentTemplate: FileInterface | null
  setCurrentTemplate: (template: FileInterface | null) => void
  resetCurrentTemplate: () => void
}

const useCurrentTemplateStore = create<CurrentTemplateStore>((set) => ({
  currentTemplate: null,
  setCurrentTemplate: (template: FileInterface | null) => set({ currentTemplate: template }),
  resetCurrentTemplate: () => set({ currentTemplate: null })
}))

export default useCurrentTemplateStore
