import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Layout } from 'components/Layout';
import { Help } from 'pages/Help';
import { MindMap } from 'pages/MindMap';
import { NoPage } from 'pages/NoPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<MindMap />} />
          <Route path='help' element={<Help />} />
          <Route path='*' element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
