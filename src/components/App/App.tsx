import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { HelpSection } from 'pages/Help';
import { Layout } from 'pages/Layout';
import { MindMap } from 'pages/MindMap';
import { NoPage } from 'pages/NoPage';

export const App: React.FC = () => {
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
};
