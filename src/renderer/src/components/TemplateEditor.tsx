import { useEffect, useState } from 'react'
import { FileInterface } from 'src/types/types'
export default function TemplateEditor() {
  const [file, setFile] = useState<FileInterface | null>(null)

  // Set up the IPC listener when component mounts
  useEffect(() => {
    // Define the callback function to run when we receive data
    const handleFileOpened = (data: FileInterface): void => {
      console.log('Received file data:', data)
      if (data !== null) {
        setFile(data)
      }
    }

    // Register the callback with our IPC listener
    window.electronAPI.onFileOpened(handleFileOpened)

    // Clean up the listener when component unmounts
    return () => {
      window.electronAPI.removeOpenFolderListener()
    }
  }, []) // Empty dependency array means this runs once on mount

  return (
    <div className="flex flex-col gap-4">
      {file !== null ? (
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-bold">{file.name}</h1>
          <p>{file.content}</p>
        </div>
      ) : (
        <p>No file selected</p>
      )}
    </div>
  )
}
