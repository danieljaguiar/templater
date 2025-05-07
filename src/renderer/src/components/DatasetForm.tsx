import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import useDatasetStore from '@/stores/datasetStore'
import { Copy, SaveIcon, SquareX } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  BaseDirectoryItem,
  DirectoryItemIPCReponse,
  DirectoryItemType,
  FieldInUse,
  FileToSave
} from '../../../types/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
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

  // Handle input change
  const handleChange = (item: FieldInUse) => {
    const updatedItem = { ...item, value: item.value } // Trim whitespace
    addOrUpdateField(updatedItem) // Update the store with the new value
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

  // Render input field
  const renderField = (dataItem: FieldInUse) => (
    <div className="grid w-full items-center gap-1.5" key={dataItem.name}>
      <Label
        htmlFor={dataItem.name}
        className={cn(dataItem.inTemplate ? 'text-primary' : 'text-muted-foreground/60')}
      >
        {dataItem.name}
      </Label>
      <div className="flex items-center justify-between">
        <Input
          className={cn(
            'flex-1',
            dataItem.inTemplate
              ? 'bg-background'
              : 'bg-muted/50 text-muted-foreground/60 border-muted/10 '
          )}
          type="text"
          id={dataItem.name}
          value={dataItem.value}
          onChange={(e) =>
            handleChange({
              ...dataItem,
              value: e.target.value
            })
          }
        />
        <Button
          className=""
          size={'icon'}
          onClick={() => {
            navigator.clipboard.writeText(dataItem.value).then(() => {
              toast({
                title: 'Copied to clipboard',
                description: `Field ${dataItem.name} copied to clipboard.`,
                variant: 'default'
              })
            })
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
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
          {sortedNonTemplateData.length > 0 ? (
            <div className="space-y-4">{sortedNonTemplateData.map(renderField)}</div>
          ) : (
            <p className="text-sm text-muted-foreground">No additional fields found.</p>
          )}
        </div>
      </div>
    </>
  )
}
