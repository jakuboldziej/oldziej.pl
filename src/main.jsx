import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext'
import { ChatContextProvider } from './context/ChatContext.jsx'
import { DartsGameContextProvider } from './context/DartsGameContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <ChatContextProvider>
      <DartsGameContextProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </DartsGameContextProvider>
    </ChatContextProvider>
  </AuthContextProvider>
)
