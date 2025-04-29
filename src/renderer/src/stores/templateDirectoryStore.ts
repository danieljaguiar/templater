import { TreeViewItem } from 'src/types/types'

interface TemplateDirectoryStore {
  templateDirectory: {
    templateDirectory: TreeViewItem[]
    basePath: string
  }
  setTemplateDirectory: (templateDirectory: TreeViewItem[], baseBath: string) => void
}

import { create } from 'zustand'

const useTemplateDirectoryStore = create<TemplateDirectoryStore>((set) => ({
  templateDirectory: {
    templateDirectory: [],
    basePath: ''
  },
  setTemplateDirectory: (templateDirectory, basePath) =>
    set({ templateDirectory: { templateDirectory, basePath } })
}))

export default useTemplateDirectoryStore
