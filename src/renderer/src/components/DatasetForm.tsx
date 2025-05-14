import { toast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import useDatasetStore from '@/stores/datasetStore'
import { SaveIcon, SquareX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DirectoryItemIPCReponse, FieldInUse, FileToSave } from '../../../types/types'
import DatasetFormField from './DatasetFormField'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

export default function DatasetForm() {
  // Get fields from the store
  const { fields, addOrUpdateField, fileInfo, setFileInfo, reset } = useDatasetStore()
  const [sortedTemplateData, setSortedTemplateData] = useState<FieldInUse[]>([])
  const [sortedNonTemplateData, setSortedNonTemplateData] = useState<FieldInUse[]>([])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [initialLoad, setInitialLoad] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const saveFile = async () => {
    if (!fileInfo || isSaving) {
      return
    }

    console.log('Saving file')
    setIsSaving(true)

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
    setIsSaving(false)

    if (fileSaveResponse !== DirectoryItemIPCReponse.SUCCESS) {
      toast({
        title: 'Error saving file',
        description: fileSaveResponse,
        variant: 'destructive'
      })
      return
    }

    if (!autoSaveEnabled) {
      // Only show toast for manual saves
      toast({
        title: 'File saved',
        description: `File ${fileToSaveLocal.name} saved successfully.`,
        variant: 'default'
      })
    }
  }

  // Use a debounced version of saveFile for autosave
  const debouncedSave = useDebounce(saveFile, 1000)

  // Autosave when fields change
  useEffect(() => {
    if (!initialLoad) {
      setInitialLoad(true)
      return
    }
    if (autoSaveEnabled && fileInfo && fields.length > 0) {
      debouncedSave()
    }
  }, [fields, autoSaveEnabled, fileInfo])

  const handleFileSave = () => {
    saveFile()
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
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="autosave"
                checked={autoSaveEnabled}
                onCheckedChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
              />
              <Label htmlFor="autosave" className="text-sm">
                Autosave
              </Label>
            </div>
            {!autoSaveEnabled && (
              <Button variant={'ghost'} onClick={handleFileSave} disabled={isSaving}>
                <SaveIcon className="h-4 w-4 mr-1" /> {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
          <Button variant={'ghost'} onClick={handleCloseDataset}>
            <SquareX className="h-4 w-4 mr-1" /> Close
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
