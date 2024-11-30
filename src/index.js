import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './Context/AppContext';
import './index.css'; // Import the global CSS file for general styles

// Get the root element
const rootElement = document.getElementById('root');

// Create a root and render the app with AppProvider and StrictMode
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
} else {
  console.error("Target container 'root' not found in the HTML file.");
}
