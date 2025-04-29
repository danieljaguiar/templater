import { registerDirectoryHandlers } from './directoryHandlers'
import { registerFileHandlers } from './fileHandlers'

export function registerIpcHandlers(): void {
  registerDirectoryHandlers()
  registerFileHandlers()
}
