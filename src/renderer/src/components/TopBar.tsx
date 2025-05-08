import React from 'react'
import { ThemeToggle } from './theme-toggle'
import UpdateIcon from './UpdateIcon'

export default function TopBar() {
  const [version, setVersion] = React.useState('')

  const getVersion = async () => {
    try {
      const version = await window.electronAPI.getCurrentVersion()
      setVersion(version)
    } catch (error) {
      console.error('Error fetching version:', error)
    }
  }

  React.useEffect(() => {
    getVersion()
  }, [])

  return (
    <div className="flex h-12 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">Templater App</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <UpdateIcon />
      </div>
    </div>
  )
}
