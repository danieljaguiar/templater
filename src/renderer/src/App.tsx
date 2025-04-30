import DataForm from './components/DataForm'
import DataPicker from './components/DataPicker'
import IPCListener from './components/IPCListener'
import TemplatePicker from './components/TemplatePicker'
import TempalteViewer from './components/TemplateViewer'
import { ThemeProvider } from './components/theme-provider'
import TopBar from './components/TopBar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'

function App(): JSX.Element {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen">
        {/* top bar */}
        <TopBar />
        <ResizablePanelGroup
          className="min-h-[calc(100vh-3rem)]"
          direction="horizontal"
          autoSaveId={'MainPanelGroup'}
        >
          <ResizablePanel className="h-full" minSize={10}>
            <TemplatePicker />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={25}>
            <TempalteViewer />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={15}>
            <DataForm />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={10}>
            <DataPicker />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <IPCListener />
    </ThemeProvider>
  )
}

export default App
