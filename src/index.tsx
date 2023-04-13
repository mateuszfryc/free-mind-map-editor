import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';

import { GlobalStyles } from 'view/styles/globalStyles';
import { theme } from 'view/styles/themeDefault';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Layout } from 'view/components/Layout';
import { MindMap } from 'view/pages/Editor';
import { Help } from 'view/pages/Help';
import { NoPage } from 'view/pages/NoPage';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <GlobalStyles />
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<MindMap />} />
              <Route path='help' element={<Help />} />
              <Route path='*' element={<NoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>,
  );
}
