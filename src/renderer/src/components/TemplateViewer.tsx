import { toast } from '@/hooks/use-toast'
import useDatasetStore from '@/stores/datasetStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import { CopyIcon, PenIcon, SquareX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

enum TextType {
  text,
  pendingPlaceholder,
  completedPlaceholder
}

interface TextBlocks {
  type: TextType
  text: string
}

interface TemplateViewerProps {
  editRequested: () => void
}

export default function TempalteViewer(props: TemplateViewerProps) {
  const { selectedTemplate, resetSelectedTemplate } = useSelectedTemplateStore()
  const fields = useDatasetStore((state) => state.fields)

  const [TextBlocks, setTextBlocks] = useState<TextBlocks[]>([])

  const handleCloseTemplate = () => {
    setTextBlocks([])
    resetSelectedTemplate()
  }

  const replacePlaceholders = () => {
    const blocks: TextBlocks[] = []
    if (!selectedTemplate) return blocks
    if (!selectedTemplate.content) return blocks
    if (selectedTemplate.content === '') return blocks
    let currentPos = 0
    let match: RegExpExecArray | null

    // Regex to find placeholders: @@name but not \@@name (escaped)
    const placeholderRegex = /(?<!@)@@([a-zA-Z0-9_]+)/g

    // Process all placeholders in the text
    while ((match = placeholderRegex.exec(selectedTemplate?.content)) !== null) {
      // Add text before the placeholder
      if (match.index > currentPos) {
        blocks.push({
          type: TextType.text,
          text: selectedTemplate.content.substring(currentPos, match.index)
        })
      }

      // Get placeholder name without the $ prefix
      const placeholderName = match[1].trim()

      // Check if the placeholder exists in the data store
      const placeholderData = fields.find((item) => item.name === placeholderName)

      if (placeholderData !== undefined) {
        // Check if it is non empty to use its value
        if (placeholderData.value.trim() !== '') {
          blocks.push({
            type: TextType.completedPlaceholder,
            text: placeholderData.value
          })
        } else {
          blocks.push({
            type: TextType.pendingPlaceholder,
            text: placeholderName
          })
        }
      } else {
        // If the placeholder does not exist, add it to the data store with an empty value
        // but only if updateDataStore is true

        blocks.push({
          type: TextType.pendingPlaceholder,
          text: placeholderName
        })
      }

      // Update current position
      currentPos = match.index + match[0].length
    }

    // Add any remaining text after the last placeholder
    if (currentPos < selectedTemplate.content.length) {
      blocks.push({
        type: TextType.text,
        text: selectedTemplate.content.substring(currentPos)
      })
    }

    return blocks
  }

  const handleCopyToClipboardAsPlainText = () => {
    const textToCopy = TextBlocks.map((block) => {
      if (block.type === TextType.text) {
        return block.text.replaceAll('@@@@', '@@')
      } else if (block.type === TextType.pendingPlaceholder) {
        return `@@${block.text}`
      } else if (block.type === TextType.completedPlaceholder) {
        return block.text
      }
      return ''
    }).join('')

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'The template has been copied to the clipboard as plain text.',
        variant: 'default'
      })
    })
  }

  useEffect(() => {
    // update the text blocks when data changes
    const blocks = replacePlaceholders() // Pass false to not update data store during this call
    setTextBlocks(blocks)
  }, [fields])

  return (
    <div>
      <div className="flex justify-start items-center mb-2 pb-4">
        <Button variant={'ghost'} onClick={() => props.editRequested()}>
          <PenIcon className="h-4 w-4" /> Edit
        </Button>
        <Button variant={'ghost'} onClick={() => handleCopyToClipboardAsPlainText()}>
          <CopyIcon className="h-4 w-4" /> Copy
        </Button>
        <Button variant={'ghost'} onClick={() => handleCloseTemplate()}>
          <SquareX className="h-4 w-4" /> Close
        </Button>
      </div>
      <pre className="whitespace-pre-wrap break-words select-text">
        {TextBlocks.map((block, index) => {
          const common = 'px-0.5 py-1'
          if (block.type === TextType.text) {
            return <span key={index}>{block.text}</span>
          } else if (block.type === TextType.pendingPlaceholder) {
            return (
              <span
                key={index}
                className={`bg-destructive text-destructive-foreground ${common}`}
              >{`@@${block.text}`}</span>
            )
          } else if (block.type === TextType.completedPlaceholder) {
            return (
              <span key={index} className={`bg-green-900/30 ${common}`}>
                {block.text}
              </span>
            )
          }
          return null
        })}
      </pre>
    </div>
  )
}
