import React from 'react';
import { HashRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AlpinaApp from './components/AlpinaApp';

// Wrapper per leggere il parametro 'lang' dall'URL (es. /app?lang=en)
const AlpinaAppWrapper = () => {
  const [searchParams] = useSearchParams();
  const lang = (searchParams.get('lang') as 'it' | 'en') || 'it';
  return <AlpinaApp lang={lang} />;
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={<AlpinaAppWrapper />} />
        {/* Redirect per qualsiasi altra rotta alla home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;