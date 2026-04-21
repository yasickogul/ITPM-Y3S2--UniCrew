import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
//import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './ChatPage';
import ChatBox from './ChatBox';
import GroupList from './GroupList';
import GroupInfoPage from './GroupInfoPage';
import SettingsPage from './SettingsPage';
import HelpPage from './HelpPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chatbox" element={<ChatBox />} />
        <Route path="/grouplist" element={<GroupList />} />
        <Route path="/groupinfo" element={<GroupInfoPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
  
);

//reportWebVitals();
