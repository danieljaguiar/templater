import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import useCurrentTemplateStore from '@/stores/currentTemplateStore'
import { useEffect, useState } from 'react'

export default function TemplateEditor() {
  const file = useCurrentTemplateStore((state) => state.currentTemplate)
  const setFile = useCurrentTemplateStore((state) => state.setCurrentTemplate)

  const [fileName, setFileName] = useState<string>('')
  const [fileContent, setFileContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Set up the IPC listener when component mounts
  useEffect(() => {
    // Only update the local state if file exists and either the name or content has changed
    if (file !== null && (fileName !== file.name || fileContent !== file.content)) {
      setFileName(file.name)
      setFileContent(file.content)
    }
  }, [file, fileName, fileContent]) // Include all dependencies that are referenced

  const handleSave = () => {
    // Reset editing state
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset to original values
    if (file) {
      setFileName(file.name)
      setFileContent(file.content)
    }
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Template Editor</CardTitle>
      </CardHeader>
      <CardContent>
        {file !== null ? (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="fileName" className="text-sm font-medium">
                File Name
              </label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fileContent" className="text-sm font-medium">
                Content
              </label>
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Textarea
                  id="fileContent"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[400px] resize-none border-0"
                />
              </ScrollArea>
            </div>

            <p className="text-sm text-muted-foreground">{file.path}</p>
          </div>
        ) : (
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-muted-foreground">No file selected</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {file &&
          (isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <Button onClick={handleEdit}>Edit</Button>
          ))}
      </CardFooter>
    </Card>
  )
}
