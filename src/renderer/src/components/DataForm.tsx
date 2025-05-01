import useDataDirectoryStore from '@/stores/dataDirectoryStore'
import useDataStore from '@/stores/dataStore'
import { useEffect, useState } from 'react'
import {
  BaseDirectoryItem,
  DataInUse,
  DirectoryItemType,
  FileSavingStatus
} from '../../../types/types'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

export default function DataForm() {
  // Get data from the store
  const { data, addOrUpdateData, fileInfo, reset } = useDataStore()
  const [stateFileName, setStateFileName] = useState<string>('')
  const dataDirectoryBasePath = useDataDirectoryStore((state) => state.dataDirectory.basePath)
  const setDataDirectory = useDataDirectoryStore((state) => state.setDataDirectory)
  const [sortedTemplateData, setSortedTemplateData] = useState<DataInUse[]>([])
  const [sortedNonTemplateData, setSortedNonTemplateData] = useState<DataInUse[]>([])
  const [fileSaveError, setFileSaveError] = useState<string | null>(null)

  // Sort and separate data when it changes
  useEffect(() => {
    const templateData = data
      .filter((item) => item.inTemplate)
      .sort((a, b) => a.name.localeCompare(b.name))
    const nonTemplateData = data
      .filter((item) => !item.inTemplate)
      .sort((a, b) => a.name.localeCompare(b.name))

    setSortedTemplateData(templateData)
    setSortedNonTemplateData(nonTemplateData)
  }, [data])

  useEffect(() => {
    if (fileInfo) {
      setStateFileName(fileInfo.name)
      setFileSaveError(null)
    }
  }, [fileInfo])

  // Handle input change
  const handleChange = (item: DataInUse) => {
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
    let fileInfoLocal: BaseDirectoryItem = fileInfo ?? {
      name: '',
      type: DirectoryItemType.FILE,
      extension: 'json',
      basePath: dataDirectoryBasePath + '/data'
    }

    const fileSaveResponse = await window.electronAPI.saveFile({
      ...fileInfoLocal,
      newFileName:
        stateFileName !== fileInfoLocal.name || fileInfoLocal.name === ''
          ? stateFileName
          : undefined,
      extension: fileInfoLocal.extension || 'json',
      content: JSON.stringify(
        data
          .filter((i) => i.value.trim() !== '')
          .map((item) => ({
            name: item.name,
            value: item.value
          })),
        null,
        2
      )
    })
    if (fileSaveResponse !== FileSavingStatus.SUCCESS) {
      setFileSaveError('Error saving file: ' + fileSaveResponse)
      console.error('Error saving file:', fileSaveResponse)
      return
    }

    const dataDirectory = await window.electronAPI.openFolderAsync(dataDirectoryBasePath)
    if (dataDirectory) {
      setDataDirectory(dataDirectory.dataDirectory, dataDirectory.basePath)
    }
  }

  // Render input field
  const renderField = (dataItem: DataInUse) => (
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
    <ScrollArea className="space-y-4 px-4 h-full">
      {/* Top bar with button to save to file */}
      <div className="flex items-center justify-between py-4">
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

      {/* Template Data */}
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

      {/* Non-Template Data */}
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
      <div>
        <pre>
          {JSON.stringify(
            {
              basePath: dataDirectoryBasePath,
              fileInfo: fileInfo
            },
            null,
            2
          )}
        </pre>
      </div>
    </ScrollArea>
  )
}
