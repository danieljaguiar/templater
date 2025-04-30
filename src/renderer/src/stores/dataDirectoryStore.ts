import { DirectoryItem } from 'src/types/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DataDirectoryStore {
  dataDirectory: {
    dataDirectory: DirectoryItem[]
    basePath: string
  }
  setDataDirectory: (dataDirectory: DirectoryItem[], baseBath: string) => void
}

const useDataDirectoryStore = create<DataDirectoryStore>()(
  persist(
    (set) => ({
      dataDirectory: {
        dataDirectory: [],
        basePath: ''
      },
      setDataDirectory: (dataDirectory, basePath) =>
        set({ dataDirectory: { dataDirectory, basePath } })
    }),
    {
      name: 'data-directory-storage' // unique name
    }
  )
)

export default useDataDirectoryStore
