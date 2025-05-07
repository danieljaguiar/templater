import { ThemeToggle } from './theme-toggle'
import UpdateIcon from './UpdateIcon'

export default function TopBar() {
  return (
    <div className="flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">Template Editor (0.0.21)</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <UpdateIcon />
      </div>
    </div>
  )
}
