import TreeView from '@/components/tree-view'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { OnOpenFolderReturn, TreeViewItem } from '../../types/types'

function App(): JSX.Element {
  const [templateTree, setTemplateTree] = useState<TreeViewItem[]>([])

  const openFolderHandler = (): void => {
    console.log('Opening folder dialog...')
    window.electronAPI.openFolder()
  }

  // Set up the IPC listener when component mounts
  useEffect(() => {
    // Define the callback function to run when we receive data
    const handleFolderData = (data: OnOpenFolderReturn): void => {
      console.log('Received folder data:', data)
      setTemplateTree(data.templateDirectory)
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
      <div className="text-white max-h-screen overflow-auto">
        <TreeView
          showCheckboxes={false}
          data={templateTree}
          onSelectionChange={(selectedItems) => {
            console.log('Selected Items:', selectedItems)
          }}
        />
      </div>
    </div>
  )
}

export default App
