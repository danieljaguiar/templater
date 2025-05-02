import useDatasetDirectoryStore from '@/stores/datasetDirectoryStore'
import useDatasetStore from '@/stores/datasetStore'
import { useEffect, useState } from 'react'
import {
  BaseDirectoryItem,
  DirectoryItemType,
  FieldInUse,
  FileSavingStatus,
  FileToSave
} from '../../../types/types'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
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
  const datasetDirectoryBasePath = useDatasetDirectoryStore(
    (state) => state.datasetDirectory.basePath
  )
  const setDatasetDirectory = useDatasetDirectoryStore((state) => state.setDatasetDirectory)
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
    let fileToSaveLocal: FileToSave = fileInfo ?? {
      name: '',
      type: DirectoryItemType.FILE,
      extension: 'json',
      basePath: datasetDirectoryBasePath + '/Datasets'
    }

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
    if (fileSaveResponse !== FileSavingStatus.SUCCESS) {
      setFileSaveError('Error saving file: ' + fileSaveResponse)
      console.error('Error saving file:', fileSaveResponse)
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
    }

    const datasetDirectory = await window.electronAPI.openFolderAsync(datasetDirectoryBasePath)
    if (datasetDirectory) {
      setDatasetDirectory(datasetDirectory.datasetDirectory, datasetDirectory.basePath)
    }
  }

  // Render input field
  const renderField = (dataItem: FieldInUse) => (
    <div className="grid w-full items-center gap-1.5" key={dataItem.name}>
      <Label htmlFor={dataItem.name}>{dataItem.name}</Label>
      <Input
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
    </div>
  )

  return (
    <ScrollArea className="h-full">
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
        <pre className="text-sm text-muted-foreground">{JSON.stringify(fileInfo, null, 2)}</pre>
      </div>
    </ScrollArea>
  )
}
