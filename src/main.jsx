// React Imports
import React from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Css
import './index.css'

// Custom Route
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ToastProvider/ToastProvider.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);