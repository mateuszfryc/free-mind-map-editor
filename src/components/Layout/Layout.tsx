import { Outlet } from 'react-router-dom';

import { Navigation } from 'components/Navigation';

export function Layout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
