import { DirectoryItem } from 'src/types/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TemplateDirectoryStore {
  templateDirectory: {
    templateDirectory: DirectoryItem[]
    basePath: string
  }
  setTemplateDirectory: (templateDirectory: DirectoryItem[], baseBath: string) => void
}

const useTemplateDirectoryStore = create<TemplateDirectoryStore>()(
  persist(
    (set) => ({
      templateDirectory: {
        templateDirectory: [],
        basePath: ''
      },
      setTemplateDirectory: (templateDirectory, basePath) =>
        set({ templateDirectory: { templateDirectory, basePath } })
    }),
    {
      name: 'template-directory-storage' // unique name
    }
  )
)

export default useTemplateDirectoryStore
