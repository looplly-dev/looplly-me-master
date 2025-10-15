import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './init/bootstrap'

// Initialize the application configuration
initializeApp().then(() => {
  console.log('✅ Application fully initialized, rendering React app');
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('❌ Failed to initialize application:', error);
  // App will still render but may have limited functionality
  // Bootstrap error handling will show user-friendly messages
  createRoot(document.getElementById("root")!).render(<App />);
});
