import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import { ThemeProvider } from './components/theme-provider'

function App(): JSX.Element {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="app-container">
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            <p className="mb-2 ">Check the console for results</p>
          </main>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}

export default App
