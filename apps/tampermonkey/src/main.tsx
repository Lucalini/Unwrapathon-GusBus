import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create or get the root container for the widget
let container = document.getElementById('root');
if (!container) {
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

