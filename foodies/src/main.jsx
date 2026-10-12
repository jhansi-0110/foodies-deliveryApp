import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

import { StoreContextProvider } from './context/StoreContext.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StoreContextProvider>
      <App />
  </StoreContextProvider>
  </BrowserRouter>
  
)
