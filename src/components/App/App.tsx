import React from 'react';

import { HelpSection } from 'components/HelpSection';
import { MindMap } from 'components/MindMap';
import { Navigation } from 'components/Navigation';
import styled from 'styled-components';

const AppContainer = styled.div`
    overflow: hidden;
    height: 100%;
    width: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const App: React.FC = () => {
    return (
        <AppContainer>
            <Navigation />
            <MindMap />
            <HelpSection />
        </AppContainer>
    );
};
