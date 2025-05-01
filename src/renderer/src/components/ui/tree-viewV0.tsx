import { cn } from '@/lib/utils'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import * as React from 'react'
import {
  DirectoryItem,
  DirectoryItemType,
  GetFullPathFromBaseFileFolderInfo
} from '../../../../types/types'

interface TreeItemProps {
  item: DirectoryItem
  level?: number
  onSelect?: (item: DirectoryItem) => void
  selectedId?: string
}

export function TreeItem({ item, level = 0, onSelect, selectedId }: TreeItemProps) {
  const [expanded, setExpanded] = React.useState(false)
  const isFolder = item.type === DirectoryItemType.FOLDER
  const hasChildren = isFolder && item.children && item.children.length > 0
  const isSelected = selectedId === GetFullPathFromBaseFileFolderInfo(item)

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
  data: DirectoryItem[]
  className?: string
  onSelectFile?: (item: DirectoryItem) => void
}

export function TreeViewV0({ data, className, onSelectFile }: TreeViewProps) {
  const { selectedTemplate } = useSelectedTemplateStore()
  const [selectedId, setSelectedId] = React.useState<string | undefined>()

  const handleSelect = (item: DirectoryItem) => {
    console.log('🚀 ~ handleSelect ~ item:', item)
    setSelectedId(item.fullPath)
    if (onSelectFile && item.type === 'file') {
      onSelectFile(item)
    }
  }

  React.useEffect(() => {
    console.log('🚀 ~ selectedTemplate:', selectedTemplate)
    if (selectedTemplate) {
      const fullPath = GetFullPathFromBaseFileFolderInfo(selectedTemplate)
      setSelectedId(fullPath)
    } else {
      setSelectedId(undefined)
    }
  }, [selectedTemplate])

  return (
    <div className={cn('p-2 ', className)}>
      {data.map((item) => (
        <TreeItem key={item.fullPath} item={item} onSelect={handleSelect} selectedId={selectedId} />
      ))}
    </div>
  )
}
