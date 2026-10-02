import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "./styles/theme.css";
import App from './App.jsx'
import TasksProvider from './components/context/TasksProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TasksProvider>
        <App />
      </TasksProvider>
    </BrowserRouter>
  </StrictMode>,
)
