import DatasetForm from './components/DatasetForm'
import DatasetPicker from './components/DatasetPicker'
import { TemplatePane } from './components/TemplatePane'
import TemplatePicker from './components/TemplatePicker'
import { ThemeProvider } from './components/theme-provider'
import TopBar from './components/TopBar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'
import { Toaster } from './components/ui/toaster'

function App(): JSX.Element {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="h-screen">
        {/* top bar */}
        <TopBar />
        <ResizablePanelGroup
          style={{ height: 'calc(100vh - 3rem)' }}
          direction="horizontal"
          autoSaveId={'MainPanelGroup'}
        >
          <ResizablePanel minSize={10}>
            <PaneWrapper>
              <TemplatePicker />
            </PaneWrapper>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={25}>
            <PaneWrapper>
              <TemplatePane />
            </PaneWrapper>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={15}>
            <PaneWrapper>
              <DatasetForm />
            </PaneWrapper>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={10}>
            <PaneWrapper>
              <DatasetPicker />
            </PaneWrapper>
          </ResizablePanel>
        </ResizablePanelGroup>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

function PaneWrapper(props: { children: React.ReactNode }) {
  return <div className="p-2">{props.children}</div>
}

export default App
