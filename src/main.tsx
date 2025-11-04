import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'survey-core/survey-core.css';
import 'survey-creator-core/survey-creator-core.css';
import './index.css'

// Render the React app directly
createRoot(document.getElementById("root")!).render(<App />);
