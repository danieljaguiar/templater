import { toast } from '@/hooks/use-toast'
import useDatasetStore from '@/stores/datasetStore'
import { Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  BaseDirectoryItem,
  DirectoryItemSavingStatus,
  DirectoryItemType,
  FieldInUse,
  FileToSave
} from '../../../types/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'

export default function DatasetForm() {
  // Get fields from the store
  const {
    fields,
    addOrUpdateField: addOrUpdateData,
    fileInfo,
    reset,
    setFileInfo
  } = useDatasetStore()
  const [stateFileName, setStateFileName] = useState<string>('')
  const [sortedTemplateData, setSortedTemplateData] = useState<FieldInUse[]>([])
  const [sortedNonTemplateData, setSortedNonTemplateData] = useState<FieldInUse[]>([])
  const [fileSaveError, setFileSaveError] = useState<string | null>(null)

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

  useEffect(() => {
    if (fileInfo) {
      setStateFileName(fileInfo.name)
      setFileSaveError(null)
    }
  }, [fileInfo])

  // Handle input change
  const handleChange = (item: FieldInUse) => {
    const updatedItem = { ...item, value: item.value } // Trim whitespace
    addOrUpdateData(updatedItem) // Update the store with the new value
  }

  const handleNewFile = async () => {
    reset()
    setStateFileName('')
  }

  const handleFileSave = async () => {
    if (stateFileName.trim() === '') {
      setFileSaveError('File name cannot be empty')
      return
    }
    if (!fileInfo) {
      setFileSaveError('No file info available')
      return
    }
    let fileToSaveLocal: FileToSave = fileInfo

    fileToSaveLocal = {
      ...fileToSaveLocal,
      newFileName:
        stateFileName !== fileToSaveLocal.name || fileToSaveLocal.name === ''
          ? stateFileName
          : undefined,
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
    if (fileSaveResponse !== DirectoryItemSavingStatus.SUCCESS) {
      setFileSaveError('Error saving file: ' + fileSaveResponse)
      console.error('Error saving file:', fileSaveResponse)
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
      <Label htmlFor={dataItem.name}>{dataItem.name}</Label>
      <div className="flex items-center justify-between">
        <Input
          className="flex-1"
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

  return (
    <>
      <div className="space-y-4 ">
        {/* Top bar with button to save to file */}
        <div className="flex items-center justify-between ">
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              handleFileSave() // Save the file when the button is clicked
            }}
          >
            Save
          </button>

          <button
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              handleNewFile()
            }}
          >
            New
          </button>
        </div>

        {/* FileName input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="fileName">File Name</Label>
          <Input
            type="text"
            id="fileName"
            value={stateFileName}
            onChange={
              (e) => setStateFileName(e.target.value) // Update the file name in the store
            }
          />
          {fileSaveError && <p className="text-sm text-red-500">{fileSaveError}</p>}
        </div>

        {/* Template */}
        <div>
          <div>
            <div>Template Fields</div>
          </div>
          <div>
            {sortedTemplateData.length > 0 ? (
              <div className="space-y-4">{sortedTemplateData.map(renderField)}</div>
            ) : (
              <p className="text-sm text-muted-foreground">No template fields found.</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Non-Template */}
        <div>
          <div>
            <div>Additional Fields</div>
          </div>
          <div>
            {sortedNonTemplateData.length > 0 ? (
              <div className="space-y-4">{sortedNonTemplateData.map(renderField)}</div>
            ) : (
              <p className="text-sm text-muted-foreground">No additional fields found.</p>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex items-center justify-between">
        <pre className="text-sm text-muted-foreground">
          {JSON.stringify(
            {
              fileInfo,
              fields
            },
            null,
            2
          )}
        </pre>
      </div>
    </>
  )
}
