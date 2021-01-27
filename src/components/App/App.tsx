import React from 'react';

import { MindMap } from 'components/MindMap';
import { Navigation } from 'components/Navigation';

export const App: React.FC = () => {
    return (
        <>
            <Navigation />
            <MindMap />
        </>
    );
};
