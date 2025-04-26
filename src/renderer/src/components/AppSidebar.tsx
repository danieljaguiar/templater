import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator
} from '@/components/ui/sidebar'
import { FolderOpen, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { OnOpenFolderReturn, TreeViewItem } from 'src/types/types'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { TreeViewV0 } from './ui/tree-viewV0'
console.log('AppSidebar.tsx loaded')

export function AppSidebar() {
  const [templateTree, setTemplateTree] = useState<TreeViewItem[] | null>([])

  const openFolderHandler = (): void => {
    console.log('Opening folder dialog...')
    window.electronAPI.openFolder()
  }

  const openSettingsHandler = (): void => {
    console.log('Opening settings...')
    // Implement settings functionality here
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={openFolderHandler} title="Open Folder">
              <FolderOpen className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={openSettingsHandler} title="Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator />
        {templateTree !== null && (
          <SidebarGroup title="Templates" className="px-2 py-2">
            <SidebarGroupLabel>Template Directory</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea>
                <TreeViewV0
                  data={templateTree}
                  onSelectFile={(fileFromTree) => {
                    console.log('Selected file:', fileFromTree)
                    window.electronAPI.openFile(fileFromTree.path)
                  }}
                />
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
