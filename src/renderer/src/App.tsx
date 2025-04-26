import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import TemplateEditor from './components/TemplateEditor'
import { ThemeProvider } from './components/theme-provider'

function App(): JSX.Element {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="app-container">
        <SidebarProvider>
          <AppSidebar />
          <main>
            <TemplateEditor />
          </main>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

export default App
