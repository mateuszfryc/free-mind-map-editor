import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';

import { GlobalStyles } from 'styles/globalStyles';
import { theme } from 'styles/themeDefault';
import { App } from 'components/App';

ReactDOM.render(
    <React.StrictMode>
        <GlobalStyles />
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
