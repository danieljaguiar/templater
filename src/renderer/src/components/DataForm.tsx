import useDataStore from '@/stores/dataStore'
import { useEffect, useState } from 'react'
import { DataInUse } from 'src/types/types'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'

export default function DataForm() {
  // Get data from the store
  const { data, addOrUpdateData } = useDataStore()
  const [sortedTemplateData, setSortedTemplateData] = useState<DataInUse[]>([])
  const [sortedNonTemplateData, setSortedNonTemplateData] = useState<DataInUse[]>([])

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

  // Handle input change
  const handleChange = (item: DataInUse) => {
    console.log('handleChange', item)
    const updatedItem = { ...item, value: item.value } // Trim whitespace
    addOrUpdateData(updatedItem) // Update the store with the new value
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
