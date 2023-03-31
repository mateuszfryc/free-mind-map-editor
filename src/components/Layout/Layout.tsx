import { Outlet } from 'react-router-dom';

import { Navigation } from 'components/Navigation';
import { UserArea } from 'components/UserArea';

export function Layout() {
  return (
    <>
      <Navigation />
      <UserArea />
      <Outlet />
    </>
  );
}
