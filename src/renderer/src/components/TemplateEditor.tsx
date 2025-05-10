import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { DirectoryItemIPCReponse, FileToSave } from '@types'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export interface TemplateEditorProps {
  editingFinished: () => void
}

export default function TemplateEditor(props: TemplateEditorProps) {
  const { selectedTemplate, setSelectedTemplate } = useSelectedTemplateStore()

  const [fileContent, setFileContent] = useState<string>('')

  // Set up the IPC listener when component mounts
  useEffect(() => {
    // Only update the local state if file exists and either the name or content has changed
    if (selectedTemplate !== null) {
      setFileContent(selectedTemplate.content || '')
    }
  }, [selectedTemplate]) // Include all dependencies that are referenced

  const handleSave = async () => {
    if (!selectedTemplate) return

    const fileToSave: FileToSave = {
      ...selectedTemplate,
      extension: selectedTemplate.extension || 'json',
      content: fileContent
    }

    const fileSaveResponse = await window.electronAPI.saveFile(fileToSave)
    if (fileSaveResponse === DirectoryItemIPCReponse.SUCCESS) {
      toast({
        title: 'File saved',
        description: `File ${selectedTemplate.name} saved successfully.`,
        variant: 'default'
      })
      setSelectedTemplate(fileToSave)
      props.editingFinished()
    } else if (fileSaveResponse === DirectoryItemIPCReponse.CONFLICT) {
      toast({
        title: 'File already exists',
        description: `File ${selectedTemplate.name} already exists. Please choose a different name.`,
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Error saving file',
        description: fileSaveResponse,
        variant: 'destructive'
      })
      console.error('Error saving file:', fileSaveResponse)
    }
  }

  const handleCancel = () => {
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
        <label htmlFor="fileContent" className="text-sm font-medium">
          Content
        </label>
        <Textarea
          id="fileContent"
          value={fileContent}
          onChange={(e) => {
            setFileContent(e.target.value)
          }}
          className="min-h-[400px] resize-none "
        />
      </div>
    </div>
  )
}
