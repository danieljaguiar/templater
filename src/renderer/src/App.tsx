function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="bg-black">
      <a target="_blank" rel="noreferrer" className="text-red-700" onClick={ipcHandle}>
        Send IPC
      </a>
    </div>
  )
}

export default App
