import React from 'react';

import { MindMap } from 'components/MindMap';
import { Navigation } from 'components/Navigation';
import { HelpSection } from 'components/HelpSection';

export const App: React.FC = () => {
    return (
        <>
            <Navigation />
            <MindMap />
            <HelpSection />
        </>
    );
};
