import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { applyDocumentTheme } from './hooks/use-theme';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/note-styles.css';
import './styles/editor.css';
import './styles/app.css';

// The app has its own context menus; the WebView default one stays off (kept in dev for DevTools).
if (!import.meta.env.DEV) {
  document.addEventListener('contextmenu', (event) => event.preventDefault());
}

// Follow Windows until the settings say otherwise (D39).
applyDocumentTheme('system');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
