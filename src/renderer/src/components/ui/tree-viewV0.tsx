import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import * as React from 'react'
import { TreeViewItem } from 'src/types/types'

interface TreeItemProps {
  item: TreeViewItem
  level?: number
  onSelect?: (item: TreeViewItem) => void
  selectedId?: string
}

export function TreeItem({ item, level = 0, onSelect, selectedId }: TreeItemProps) {
  const [expanded, setExpanded] = React.useState(false)
  const isFolder = item.type === 'folder'
  const hasChildren = isFolder && item.children && item.children.length > 0
  const isSelected = selectedId === item.fullPath

  const handleToggle = () => {
    if (isFolder) {
      setExpanded(!expanded)
    }
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(item)
    }
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted/20 transition-colors',
          isSelected && 'ring-muted/80 dark:bg-accent bg-accent/40 ring-2'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleSelect}
      >
        {isFolder && hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            className="mr-1 p-1 rounded-sm hover:bg-muted/90"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-7 min-w-7" />
        )}

        {isFolder ? (
          <Folder className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
        ) : (
          <File className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
        )}

        <span className="truncate">{item.name}</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {item.children?.map((child) => (
            <TreeItem
              key={child.fullPath}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </>
  )
}

interface TreeViewProps {
  data: TreeViewItem[]
  className?: string
  onSelectFile?: (item: TreeViewItem) => void
}

export function TreeViewV0({ data, className, onSelectFile }: TreeViewProps) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>()

  const handleSelect = (item: TreeViewItem) => {
    setSelectedId(item.fullPath)
    if (onSelectFile && item.type === 'file') {
      onSelectFile(item)
    }
  }

  return (
    <div className={cn('p-2 ', className)}>
      {data.map((item) => (
        <TreeItem key={item.fullPath} item={item} onSelect={handleSelect} selectedId={selectedId} />
      ))}
    </div>
  )
}
