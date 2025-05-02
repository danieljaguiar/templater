import DatasetForm from './components/DatasetForm'
import DataPicker from './components/DatasetPicker'
import { TemplatePane } from './components/TemplatePane'
import TemplatePicker from './components/TemplatePicker'
import { ThemeProvider } from './components/theme-provider'
import TopBar from './components/TopBar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'

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
            <TemplatePicker />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={25}>
            <TemplatePane />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={15}>
            <DatasetForm />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={10}>
            <DataPicker />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ThemeProvider>
  )
}

export default App
