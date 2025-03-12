import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

function App(): JSX.Element {
  const [result, setResult] = useState<string>('')

  const openFolderHandler = (): void => {
    console.log('Opening folder dialog...')
    window.electronAPI.openFolder()
  }

  // Set up the IPC listener when component mounts
  useEffect(() => {
    // Define the callback function to run when we receive data
    const handleFolderData = (data: any): void => {
      console.log('Received data from main process:')
      console.log('Template files:', data.files)
      console.log('Data files with content:', data.dataFiles)
      setResult(JSON.stringify(data, null, 2))
    }

    // Register the callback with our IPC listener
    window.electronAPI.onFolderOpened(handleFolderData)

    // Clean up the listener when component unmounts
    return () => {
      window.electronAPI.removeOpenFolderListener()
    }
  }, []) // Empty dependency array means this runs once on mount

  return (
    <div className="bg-black flex flex-col items-center justify-center h-screen ">
      <Button onClick={openFolderHandler} className="mb-4">
        Open Folder
      </Button>
      pack
      <p className="text-white mb-2 ">Check the console for results</p>
      <pre className="text-white max-h-screen overflow-auto">{result}</pre>
    </div>
  )
}

export default App
