import useDataStore from '@/stores/dataStore'
import useSelectedTemplateStore from '@/stores/selectedTemplateStore'
import useTemplateDirectoryStore from '@/stores/templateDirectoryStore'
import { useEffect, useState } from 'react'
import { DirectoryItemType } from '../../../types/types'
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
  const { selectedTemplate, setSelectedTemplate } = useSelectedTemplateStore()
  const { templateDirectory } = useTemplateDirectoryStore()
  const data = useDataStore((state) => state.data)
  const addOrUpdateData = useDataStore((state) => state.addOrUpdateData)

  const [fileName, setFileName] = useState<string>('')
  const [fileContent, setFileContent] = useState<string>('')
  const [TextBlocks, setTextBlocks] = useState<TextBlocks[]>([])

  const replacePlaceholders = (text: string, updateDataStore = false) => {
    const blocks: TextBlocks[] = []
    let currentPos = 0
    let match: RegExpExecArray | null

    // Regex to find placeholders: @@name but not \@@name (escaped)
    const placeholderRegex = /(?<!@)@@([a-zA-Z0-9_]+)/g

    // Process all placeholders in the text
    while ((match = placeholderRegex.exec(text)) !== null) {
      // Add text before the placeholder
      if (match.index > currentPos) {
        blocks.push({
          type: TextType.text,
          text: text.substring(currentPos, match.index)
        })
      }

      // Get placeholder name without the $ prefix
      const placeholderName = match[1].trim()

      // Check if the placeholder exists in the data store
      const placeholderData = data.find((item) => item.name === placeholderName)

      if (placeholderData !== undefined) {
        // Update the data store to mark it as in use, but only if updateDataStore is true
        if (updateDataStore && !placeholderData.inTemplate) {
          addOrUpdateData({
            ...placeholderData,
            inTemplate: true
          })
        }

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
        if (updateDataStore) {
          addOrUpdateData({
            name: placeholderName,
            value: '',
            inTemplate: true,
            inDataFile: false
          })
        }

        blocks.push({
          type: TextType.pendingPlaceholder,
          text: placeholderName
        })
      }

      // Update current position
      currentPos = match.index + match[0].length
    }

    // Add any remaining text after the last placeholder
    if (currentPos < text.length) {
      blocks.push({
        type: TextType.text,
        text: text.substring(currentPos)
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
      console.log('Text copied to clipboard')
    })
  }

  const handleNewFile = () => {
    setSelectedTemplate({
      name: '',
      content: '',
      extension: 'txt',
      type: DirectoryItemType.FILE,
      basePath: templateDirectory.basePath + '/templates'
    })
    props.editRequested()
  }

  useEffect(() => {
    if (
      selectedTemplate !== null &&
      selectedTemplate.content &&
      (fileName !== selectedTemplate.name || fileContent !== selectedTemplate.content)
    ) {
      setFileName(selectedTemplate.name)
      setFileContent(selectedTemplate.content)
    }
  }, [selectedTemplate, fileName, fileContent])

  useEffect(() => {
    // update the text blocks when data changes
    const blocks = replacePlaceholders(fileContent, false) // Pass false to not update data store during this call
    setTextBlocks(blocks)
  }, [data, fileContent])

  // Separate effect to update data store when fileContent changes, but NOT when data changes
  useEffect(() => {
    if (fileContent) {
      replacePlaceholders(fileContent, true) // Pass true to update data store
    }
  }, [fileContent]) // Only depend on fileContent, not data

  return (
    <div>
      <div className="flex justify-between items-center mb-2 pb-4">
        <Button onClick={() => handleNewFile()}>New</Button>
        <Button onClick={() => props.editRequested()}>Edit</Button>
        <Button onClick={() => handleCopyToClipboardAsPlainText()}>Copy</Button>
      </div>
      <pre className="whitespace-pre-wrap break-words">
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
