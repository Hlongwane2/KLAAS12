import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("Mounting Klaas App at #root...");

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error("Root element not found in index.html");
  }
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log("App mounted successfully.");
} catch (err) {
  console.error("Critical error during app mounting:", err);
}
