import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CombinedContextProvider } from './context/CombinedContextProviders';

ReactDOM.createRoot(document.getElementById('root')).render(
  <CombinedContextProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </CombinedContextProvider>
);