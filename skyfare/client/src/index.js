import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './index.css';
import App from './App';
import { SearchProvider } from './context/SearchContext';

// React 17 render API (per the project's React-version toggle).
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3500} newestOnTop theme="colored" />
      </SearchProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
