import { toast } from '@/hooks/use-toast'
import useDatasetStore from '@/stores/datasetStore'
import { SaveIcon, SquareX } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  BaseDirectoryItem,
  DirectoryItemIPCReponse,
  DirectoryItemType,
  FieldInUse,
  FileToSave
} from '../../../types/types'
import DatasetFormField from './DatasetFormField'
import { Button } from './ui/button'
import { Label } from './ui/label'

export default function DatasetForm() {
  // Get fields from the store
  const { fields, addOrUpdateField, fileInfo, setFileInfo, reset } = useDatasetStore()
  const [sortedTemplateData, setSortedTemplateData] = useState<FieldInUse[]>([])
  const [sortedNonTemplateData, setSortedNonTemplateData] = useState<FieldInUse[]>([])

  // Sort and separate dataset when it changes
  useEffect(() => {
    const templateData = fields
      .filter((item) => item.inTemplate)
      .sort((a, b) => a.name.localeCompare(b.name))
    const nonTemplateData = fields
      .filter((item) => !item.inTemplate)
      .sort((a, b) => a.name.localeCompare(b.name))

    setSortedTemplateData(templateData)
    setSortedNonTemplateData(nonTemplateData)
  }, [fields])

  const handleCloseDataset = () => {
    setSortedTemplateData([]) // Clear the sorted template data
    setSortedNonTemplateData([]) // Clear the sorted non-template data
    reset() // Reset the dataset store
  }

  // Handle input change (this will be passed to FieldInput)
  const handleFieldUpdate = (item: FieldInUse) => {
    addOrUpdateField(item)
  }

  const handleFileSave = async () => {
    if (!fileInfo) {
      return
    }
    let fileToSaveLocal: FileToSave = fileInfo

    fileToSaveLocal = {
      ...fileToSaveLocal,
      extension: fileToSaveLocal.extension || 'json',
      content: JSON.stringify(
        fields
          .filter((i) => i.value.trim() !== '')
          .map((item) => ({
            name: item.name,
            value: item.value
          })),
        null,
        2
      )
    }

    const fileSaveResponse = await window.electronAPI.saveFile(fileToSaveLocal)
    if (fileSaveResponse !== DirectoryItemIPCReponse.SUCCESS) {
      toast({
        title: 'Error saving file',
        description: fileSaveResponse,
        variant: 'destructive'
      })
      return
    }

    if (fileToSaveLocal.newFileName) {
      // If a new file name is provided, update the fileInfo in the store
      const baseFile = {
        name: fileToSaveLocal.newFileName,
        type: DirectoryItemType.FILE,
        extension: fileToSaveLocal.extension,
        basePath: fileToSaveLocal.basePath
      } as BaseDirectoryItem
      setFileInfo(baseFile)
      // toast file created
      toast({
        title: 'File created',
        description: `File ${fileToSaveLocal.newFileName} created successfully.`,
        variant: 'default'
      })
    } else {
      toast({
        title: 'File saved',
        description: `File ${fileToSaveLocal.name} saved successfully.`,
        variant: 'default'
      })
    }
  }

  const handleCopyField = (valueToCopy: string, fieldName: string) => {
    navigator.clipboard.writeText(valueToCopy).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: `Field ${fieldName} copied to clipboard.`,
        variant: 'default'
      })
    })
  }

  // Render input field using the new FieldInput component
  const renderField = (dataItem: FieldInUse) => (
    <DatasetFormField
      key={dataItem.name} // Key is important here for React's reconciliation
      field={dataItem}
      onFieldChange={handleFieldUpdate}
      onCopy={handleCopyField}
    />
  )

  if (!fileInfo) {
    return (
      <div className="text-sm text-muted-foreground/70 p-4 border rounded-md bg-muted/10 border-muted/20 flex items-center justify-center h-full">
        No dataset selected.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 ">
        {/* Top bar with button to save to file */}
        <div className="flex items-center ">
          <Button
            variant={'ghost'}
            onClick={() => {
              handleFileSave() // Save the file when the button is clicked
            }}
          >
            <SaveIcon className="h-4 w-4" /> Save
          </Button>
          <Button
            variant={'ghost'}
            onClick={() => {
              handleCloseDataset() // Close the dataset when the button is clicked
            }}
          >
            <SquareX className="h-4 w-4" /> Close
          </Button>
        </div>

        {/* Dataset Filename as div, not input*/}
        <div>
          <Label className="text-2xl font-medium text-muted-foreground/70 ">
            {fileInfo && fileInfo.name}
          </Label>
        </div>

        {/* Template */}
        <div>
          <div className="space-y-4">{sortedTemplateData.map(renderField)}</div>
        </div>

        {/* Non-Template */}
        <div>
          <div className="space-y-4">{sortedNonTemplateData.map(renderField)}</div>
        </div>
      </div>
    </>
  )
}
