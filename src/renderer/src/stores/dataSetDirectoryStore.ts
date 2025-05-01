import { DirectoryItem } from 'src/types/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DataDirectoryStore {
  dataSetDirectory: {
    dataSetDirectory: DirectoryItem[]
    basePath: string
  }
  setDataSetDirectory: (dataDirectory: DirectoryItem[], baseBath: string) => void
}

const useDataDirectoryStore = create<DataDirectoryStore>()(
  persist(
    (set) => ({
      dataSetDirectory: {
        dataSetDirectory: [],
        basePath: ''
      },
      setDataSetDirectory: (dataSetDirectory, basePath) =>
        set({ dataSetDirectory: { dataSetDirectory, basePath } })
    }),
    {
      name: 'data-directory-storage' // unique name
    }
  )
)

export default useDataDirectoryStore
