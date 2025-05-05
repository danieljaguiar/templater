import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export interface TemplateEditorProps {
  editingFinished: () => void
}

export default function TemplateEditor(props: TemplateEditorProps) {
  const { selectedTemplate, setSelectedTemplate } = useSelectedTemplateStore()
  const { templateDirectory } = useTemplateDirectoryStore()

  const [fileName, setFileName] = useState<string>('')
  const [fileContent, setFileContent] = useState<string>('')

  // Set up the IPC listener when component mounts
  useEffect(() => {
    // Only update the local state if file exists and either the name or content has changed
    if (
      selectedTemplate !== null &&
      (fileName !== selectedTemplate.name || fileContent !== selectedTemplate.content)
    ) {
      if (selectedTemplate.content === null || selectedTemplate.content === undefined) {
        console.error('File content is null.')
        return
      }
      setFileName(selectedTemplate.name)
      setFileContent(selectedTemplate.content)
    }
  }, [selectedTemplate]) // Include all dependencies that are referenced

  const handleSave = async () => {
    if (!selectedTemplate) return

    const fileSaveResponse = await window.electronAPI.saveFile({
      ...selectedTemplate,
      newFileName:
        fileName !== selectedTemplate.name || selectedTemplate.name === '' ? fileName : undefined,
      extension: selectedTemplate.extension || 'json',
      content: fileContent
    })
    props.editingFinished()
  }

  const handleCancel = () => {
    // Reset to original values
    if (selectedTemplate) {
      setFileName(selectedTemplate.name)
      setFileContent(selectedTemplate.content!) // HACK: This "!" is a temporary fix to avoid null error
    }
    props.editingFinished()
  }

  return (
    <div className="">
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="btn btn-primary">
            Save
          </Button>
          <Button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="fileName" className="text-sm font-medium">
          File Name
        </label>
        <Input id="fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label htmlFor="fileContent" className="text-sm font-medium">
          Content
        </label>
        <Textarea
          id="fileContent"
          value={fileContent}
          onChange={(e) => {
            setFileContent(e.target.value)
          }}
          className="min-h-[400px] resize-none border-0"
        />
      </div>
    </div>
  )
}
