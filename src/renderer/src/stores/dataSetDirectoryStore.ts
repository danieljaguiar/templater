import { DirectoryItem } from 'src/types/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DatasetDirectoryStore {
  datasetDirectory: {
    datasetDirectory: DirectoryItem[]
    basePath: string
  }
  setDatasetDirectory: (datasetDirectory: DirectoryItem[], baseBath: string) => void
}

const useDatasetDirectoryStore = create<DatasetDirectoryStore>()(
  persist(
    (set) => ({
      datasetDirectory: {
        datasetDirectory: [],
        basePath: ''
      },
      setDatasetDirectory: (dataSetDirectory, basePath) =>
        set({ datasetDirectory: { datasetDirectory: dataSetDirectory, basePath } })
    }),
    {
      name: 'data-directory-storage' // unique name
    }
  )
)

export default useDatasetDirectoryStore
