import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import "@/assets/styles/home.scss"
import { HomeContextProviders } from './context/Home/HomeContextProviders.jsx';
import { PortfolioContextProviders } from './context/Portfolio/PortfolioContextProviders.jsx';

const subdomain = window.location.host.split(".")[0];

let ContextProvider;
if (subdomain === "home") {
  ContextProvider = HomeContextProviders
} else {
  ContextProvider = PortfolioContextProviders
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ContextProvider>
    {/* <React.StrictMode> */}
    <App />
    {/* </React.StrictMode> */}
  </ContextProvider>
);
