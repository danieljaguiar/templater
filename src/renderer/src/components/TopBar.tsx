import { Settings } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

export default function TopBar() {
  const openSettingsHandler = (): void => {
    // Implement settings functionality here
  }

  return (
    <div className="flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">Template Editor (0.0.21)</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={openSettingsHandler} title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
