import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CharacterList from './pages/CharacterList';
import CharacterDetail from './pages/CharacterDetail';
import CharacterCreate from './pages/CharacterCreate';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { QueryClient } from "react-query";
import { Toaster } from 'react-hot-toast';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <QueryClient>
            <div className="App">
              <Routes>
                <Route path="/" element={<CharacterList />} />
                <Route path="/characters/:id" element={<CharacterDetail />} />
                <Route path="/create" element={<CharacterCreate />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
              <Toaster />
            </div>
          </QueryClient>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
