import { useEffect } from 'react'
import DatasetForm from './components/DatasetForm'
import DatasetPicker from './components/DatasetPicker'
import { TemplatePane } from './components/TemplatePane'
import TemplatePicker from './components/TemplatePicker'
import { ThemeProvider } from './components/theme-provider'
import TopBar from './components/TopBar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'
import { ScrollArea } from './components/ui/scroll-area'
import { Toaster } from './components/ui/toaster'
import { cn } from './lib/utils'

function App(): JSX.Element {
  useEffect(() => {
    if (window) {
      window.electronAPI.rendererIsReady()
    }
  }, [])
  return (
    <ThemeProvider defaultTheme="system">
      <div className="h-screen">
        {/* top bar */}
        <TopBar />
        <ResizablePanelGroup
          style={{ height: 'calc(100vh - 3rem)' }}
          direction="horizontal"
          autoSaveId={'MainPanelGroupMain'}
        >
          <ResizablePanel minSize={20}>
            <div className="flex flex-col h-full">
              <SectionName name="Templates" />
              <ResizablePanelGroup
                style={{ height: '100%' }}
                direction="horizontal"
                autoSaveId={'MainPanelGroupTemplate'}
              >
                <ResizablePanel minSize={10}>
                  <PaneWrapper name="Template Picker">
                    <TemplatePicker />
                  </PaneWrapper>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={25}>
                  <PaneWrapper name="Template Editor">
                    <TemplatePane />
                  </PaneWrapper>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-primary/10 border-l border-r w-7" withHandle />

          <ResizablePanel minSize={20}>
            <div className="flex flex-col h-full">
              <SectionName align="right" name="Datasets" />
              <ResizablePanelGroup
                style={{ height: '100%' }}
                direction="horizontal"
                autoSaveId={'MainPanelGroupDataset'}
              >
                <ResizablePanel minSize={15}>
                  <PaneWrapper name="Dataset Editor">
                    <DatasetForm />
                  </PaneWrapper>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={10}>
                  <PaneWrapper name="Dataset Picker">
                    <DatasetPicker />
                  </PaneWrapper>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

function PaneWrapper(props: { children: React.ReactNode; name: string }) {
  return (
    <div className="pl-4 pr-1 py-2 h-full">
      <ScrollArea className="h-full pr-4">
        <div className="w-full text-2xl font-bold text-muted-foreground bg-background border-b px-4 py-3 mb-2">
          {props.name}
        </div>

        {props.children}
      </ScrollArea>
    </div>
  )
}

function SectionName(props: { name: string; align?: 'left' | 'right' }) {
  return (
    <div
      className={cn(
        'flex items-center px-4 py-3 text-sm font-medium text-muted-foreground bg-background border-b ',
        'text-4xl font-extrabold',
        // props.align === 'right' ? 'justify-end' : 'justify-start'
        'justify-center'
      )}
    >
      {props.name}
    </div>
  )
}

export default App
