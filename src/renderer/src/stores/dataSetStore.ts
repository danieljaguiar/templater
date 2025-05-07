import { BaseDirectoryItem, FieldInUse } from '@types'
import { create } from 'zustand'
import useSelectedTemplateStore from './selectedTemplateStore'

interface DatasetStore {
  fields: FieldInUse[]
  fileInfo: BaseDirectoryItem | null
  setFileInfo: (fileInfo: BaseDirectoryItem | null) => void
  setFields: (fields: FieldInUse[]) => void
  addOrUpdateField: (field: FieldInUse) => void
  mergePlaceholdersToFields: (placeholders: string[]) => void
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
  setFields: (fields) =>
    set(() => {
      const { placeholders } = useSelectedTemplateStore.getState()

      // Update the existing fields and set inTemplate to true for those that are in the template
      // if the field is not in the template, set inTemplate to false
      // if the field is not in the dataset, add it to the dataset

      const fieldsProcessedWithPlaceholder = fields.map((field) => {
        const isInTemplate = placeholders.includes(field.name)
        return { ...field, inTemplate: isInTemplate }
      })

      const placeholdersMissing = placeholders.filter((placeholder) => {
        return !fields.some((field) => field.name === placeholder)
      })

      const fieldsWithMissingPlaceholders = placeholdersMissing.map((placeholder) => {
        return {
          name: placeholder,
          value: '',
          inDisk: false,
          inTemplate: true
        }
      })

      return {
        fields: [...fieldsProcessedWithPlaceholder, ...fieldsWithMissingPlaceholders]
      }
    }),
  mergePlaceholdersToFields: (placeholders) =>
    set((state) => {
      const fieldsProcessedWithPlaceholder = state.fields.map((field) => {
        const isInTemplate = placeholders.includes(field.name)
        return { ...field, inTemplate: isInTemplate }
      })

      const placeholdersMissing = placeholders.filter((placeholder) => {
        return !state.fields.some((field) => field.name === placeholder)
      })

      const fieldsWithMissingPlaceholders = placeholdersMissing.map((placeholder) => {
        return {
          name: placeholder,
          value: '',
          inDisk: false,
          inTemplate: true
        }
      })

      return {
        fields: [...fieldsProcessedWithPlaceholder, ...fieldsWithMissingPlaceholders]
      }
    }),
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
  reset: () =>
    set((state) => {
      const resetedFields = state.fields.map((d) => {
        return { ...d, inDisk: false, value: '' }
      })
      return { fields: resetedFields, fileInfo: null }
    })
}))

export default useDatasetStore
