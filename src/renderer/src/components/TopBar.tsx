import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { FolderOpen, RefreshCw, Settings } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

export default function TopBar() {
  const basePath = useTemplateDirectoryStore((state) => state.templateDirectory.basePath)
  const openFolderHandler = (): void => {
    window.electronAPI.openFolder()
  }

  const openSettingsHandler = (): void => {
    console.log('Opening settings...')
    // Implement settings functionality here
  }

  const reloadTemplateDirectoryHandler = (): void => {
    console.log('Reloading template directory...')
    if (basePath !== '') {
      window.electronAPI.openFolder(basePath)
    } else {
      console.error('Base path is empty. Cannot reload template directory.')
    }
  }

  return (
    <div className="flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">Template Editor</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={openFolderHandler} title="Open Folder">
          <FolderOpen className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={reloadTemplateDirectoryHandler} title="Reload">
          <RefreshCw className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={openSettingsHandler} title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
