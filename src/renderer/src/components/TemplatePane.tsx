import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { useState } from 'react'
import TemplateEditor from './TemplateEditor'
import TempalteViewer from './TemplateViewer'
import { ScrollArea } from './ui/scroll-area'

export const TemplatePane = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { selectedTemplate } = useSelectedTemplateStore()

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
