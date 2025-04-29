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
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { FolderOpen, Settings } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { TreeViewV0 } from './ui/tree-viewV0'

export function AppSidebar() {
  const templateTree = useTemplateDirectoryStore(
    (state) => state.templateDirectory.templateDirectory
  )

  const openFolderHandler = (): void => {
    window.electronAPI.openFolder()
  }

  const openSettingsHandler = (): void => {
    console.log('Opening settings...')
    // Implement settings functionality here
  }

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
