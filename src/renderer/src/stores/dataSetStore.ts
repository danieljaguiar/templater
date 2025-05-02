import { BaseDirectoryItem, FieldInUse } from 'src/types/types'
import { create } from 'zustand'

interface DatasetStore {
  fields: FieldInUse[]
  fileInfo: BaseDirectoryItem | null
  setFileInfo: (fileInfo: BaseDirectoryItem | null) => void
  setFields: (fields: FieldInUse[]) => void
  addOrUpdateField: (field: FieldInUse) => void
  removeField: (field: FieldInUse) => void
  removeFieldsNotInUseAndResetTemplateFlag: () => void
  reset: () => void
}

const useDatasetStore = create<DatasetStore>((set) => ({
  fields: [],
  fileInfo: null,
  setFileInfo: (fileInfo) => set({ fileInfo }),
  removeFieldsNotInUseAndResetTemplateFlag: () => {
    set((state) => {
      // Remove fields that inDisk = false
      // set all inTemplate to false
      const updatedDataset = state.fields.map((f) => {
        return { ...f, inTemplate: false }
      })
      return { fields: updatedDataset.filter((f) => f.inDisk || f.value.trim() !== '') }
    })
  },
  setFields: (fields) => set({ fields }),
  addOrUpdateField: (field) =>
    set((state) => {
      const existingFieldIndex = state.fields.findIndex((f) => f.name === field.name)
      if (existingFieldIndex !== -1) {
        const updatedFields = [...state.fields]
        updatedFields[existingFieldIndex] = field
        return { fields: updatedFields }
      } else {
        return { fields: [...state.fields, field] }
      }
    }),
  removeField: (field) =>
    set((state) => ({ fields: state.fields.filter((f) => f.name !== field.name) })),
  reset: () =>
    set((state) => {
      const resetedFields = state.fields.map((d) => {
        return { ...d, inDisk: false, value: '' }
      })
      return { fields: resetedFields, fileInfo: null }
    })
}))

export default useDatasetStore
