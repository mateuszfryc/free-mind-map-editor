import React, { useEffect } from 'react';

import { HelpSection } from 'components/HelpSection';
import { MindMap } from 'components/MindMap';
import { Navigation } from 'components/Navigation';
import styled from 'styled-components';
import console from 'console';

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
    useEffect(() => {
        const updateRootSize = () => {
            const { innerWidth, innerHeight } = window;
            const root = document.querySelector<HTMLDivElement>('div#root');
            if (root) {
                root.style.width = `${innerWidth}px`;
                root.style.height = `${innerHeight}px`;
            }
            const { body } = document;
            if (body) {
                body.style.width = `${innerWidth}px`;
                body.style.height = `${innerHeight}px`;
            }
        };
        updateRootSize();

        window.addEventListener('resize', updateRootSize);

        return () => {
            window.removeEventListener('resize', updateRootSize);
        };
    }, []);

    return (
        <AppContainer>
            <Navigation />
            <MindMap />
            <HelpSection />
        </AppContainer>
    );
};
