import React from 'react';
import { Outlet } from 'react-router-dom';

import { Navigation } from 'components/Navigation';

export const Layout: React.FC = () => {
    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
};
