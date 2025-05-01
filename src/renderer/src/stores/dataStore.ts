import { BaseDirectoryItem, DataInUse } from 'src/types/types'
import { create } from 'zustand'

interface DataStore {
  data: DataInUse[]
  fileInfo: BaseDirectoryItem | null
  setFileInfo: (fileInfo: BaseDirectoryItem | null) => void
  setData: (data: DataInUse[]) => void
  addOrUpdateData: (data: DataInUse) => void
  removeData: (data: DataInUse) => void
  removeFieldsNotInUseAndResetTemplateFlag: () => void
  reset: () => void
}

const useDataStore = create<DataStore>((set) => ({
  data: [],
  fileInfo: null,
  setFileInfo: (fileInfo) => set({ fileInfo }),
  removeFieldsNotInUseAndResetTemplateFlag: () => {
    set((state) => {
      // Remove fields that inDataFile = false
      // set all inTemplate to false
      const updatedData = state.data.map((d) => {
        return { ...d, inTemplate: false }
      })
      return { data: updatedData.filter((d) => d.inDataFile || d.value.trim() !== '') }
    })
  },
  setData: (data) => set({ data }),
  addOrUpdateData: (data) =>
    set((state) => {
      const existingDataIndex = state.data.findIndex((d) => d.name === data.name)
      if (existingDataIndex !== -1) {
        const updatedData = [...state.data]
        updatedData[existingDataIndex] = data
        return { data: updatedData }
      } else {
        return { data: [...state.data, data] }
      }
    }),
  removeData: (data) => set((state) => ({ data: state.data.filter((d) => d.name !== data.name) })),
  reset: () =>
    set((state) => {
      const newData = state.data.map((d) => {
        return { ...d, inDataFile: false, value: '' }
      })
      return { data: newData, fileInfo: null }
    })
}))

export default useDataStore
