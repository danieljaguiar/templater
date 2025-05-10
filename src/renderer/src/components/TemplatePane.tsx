import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { useEffect, useState } from 'react'
import TemplateEditor from './TemplateEditor'
import TempalteViewer from './TemplateViewer'
import { ScrollArea } from './ui/scroll-area'

export const TemplatePane = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { selectedTemplate } = useSelectedTemplateStore()

  useEffect(() => {
    if (selectedTemplate) {
      setIsEditing(false)
    }
  }, [selectedTemplate])

  if (!selectedTemplate) {
    return (
      <div className="text-sm text-muted-foreground/70 p-4 border rounded-md bg-muted/10 border-muted/20 flex items-center justify-center h-full">
        No template selected
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea>
        {/* bar with button icons for edit/save, cancel and delete */}
        {isEditing || !selectedTemplate?.content ? (
          <TemplateEditor editingFinished={() => setIsEditing(false)} />
        ) : (
          <TempalteViewer editRequested={() => setIsEditing(true)} />
        )}
      </ScrollArea>
    </div>
  )
}
