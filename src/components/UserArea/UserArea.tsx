import { MenuButton } from '../Navigation/Navigation.styled';
import * as Styled from './UserArea.styled';

export function UserArea() {
  return (
    <Styled.UserArea>
      <MenuButton type='button' style={{ marginRight: '10px' }}>
        Log In
      </MenuButton>
      <MenuButton primary type='button'>
        Sign In
      </MenuButton>
    </Styled.UserArea>
  );
}
