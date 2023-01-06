import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';

import { GlobalStyles } from 'styles/globalStyles';
import { theme } from 'styles/themeDefault';
import { App } from 'components/App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <GlobalStyles />
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
}
