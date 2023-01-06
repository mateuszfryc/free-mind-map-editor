import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { HelpSection } from 'pages/Help';
import { Layout } from 'pages/Layout';
import { MindMap } from 'pages/MindMap';
import { NoPage } from 'pages/NoPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<MindMap />} />
          <Route path='help' element={<HelpSection />} />
          <Route path='*' element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
