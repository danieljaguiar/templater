import useDataDirectoryStore from '@/stores/dataDirectoryStore'
import useDataStore from '@/stores/dataStore'
import { useEffect, useState } from 'react'
import { DataInUse } from 'src/types/types'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'

export default function DataForm() {
  // Get data from the store
  const { data, addOrUpdateData, fileInfo } = useDataStore()
  const [stateFileName, setStateFileName] = useState<string>('')
  const dataDirectoryBasePath = useDataDirectoryStore((state) => state.dataDirectory.basePath)
  const setDataDirectory = useDataDirectoryStore((state) => state.setDataDirectory)
  const [sortedTemplateData, setSortedTemplateData] = useState<DataInUse[]>([])
  const [sortedNonTemplateData, setSortedNonTemplateData] = useState<DataInUse[]>([])

  // Sort and separate data when it changes
  useEffect(() => {
    console.log('DataForm data', data)
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
    }
  }, [fileInfo])

  // Handle input change
  const handleChange = (item: DataInUse) => {
    console.log('handleChange', item)
    const updatedItem = { ...item, value: item.value } // Trim whitespace
    addOrUpdateData(updatedItem) // Update the store with the new value
  }

  const handleFileSave = async () => {
    if (stateFileName.trim() === '') {
      alert('File name cannot be empty')
      return
    }

    if (fileInfo) {
      await window.electronAPI.saveFile({
        ...fileInfo,
        newFileName: stateFileName !== fileInfo.name ? stateFileName : undefined,
        extension: 'json',
        content: JSON.stringify(
          data.map((item) => ({
            name: item.name,
            value: item.value
          })),
          null,
          2
        )
      })
      const dataDirectory = await window.electronAPI.openFolderAsync(dataDirectoryBasePath)
      if (dataDirectory) {
        setDataDirectory(dataDirectory.dataDirectory, dataDirectory.basePath)
      }
      console.log('File saved successfully')
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
    <div className="space-y-4 px-8">
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
    </div>
  )
}
