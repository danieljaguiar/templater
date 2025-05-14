import { cn } from '@/lib/utils'
import { FieldInUse } from '@types'
import { Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

// Define props for the new FieldInput component
interface FieldInputProps {
  field: FieldInUse
  onFieldChange: (updatedField: FieldInUse) => void
  onCopy: (valueToCopy: string, fieldName: string) => void
}

const DatasetFormField: React.FC<FieldInputProps> = ({ field, onFieldChange, onCopy }) => {
  const [localValue, setLocalValue] = useState(field.value)

  // Effect to sync localValue if the field.value prop changes from an external source
  useEffect(() => {
    if (field.value !== localValue) {
      setLocalValue(field.value)
    }
  }, [field.value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue) // Update local state immediately
    onFieldChange({ ...field, value: newValue }) // Propagate change to parent/global store
  }

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label
        htmlFor={field.name}
        className={cn(field.inTemplate ? 'text-primary' : 'text-muted-foreground/60')}
      >
        {field.name}
      </Label>
      <div className="flex items-center justify-between">
        <Input
          className={cn(
            'flex-1',
            field.inTemplate
              ? 'bg-background'
              : 'bg-muted/50 text-muted-foreground/60 border-muted/10 '
          )}
          type="text"
          id={field.name}
          value={localValue} // Controlled by local state
          onChange={handleInputChange}
        />
        <Button
          className=""
          size={'icon'}
          onClick={() => onCopy(localValue, field.name)} // Use localValue for copy
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default DatasetFormField
