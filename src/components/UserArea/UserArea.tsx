import { FoldableArea } from '../FoldableArea';
import * as Styled from './UserArea.styled';

export function UserArea() {
  return (
    <Styled.UserArea>
      <FoldableArea alignContainerRight buttonContent='Log In'>
        Log in form
      </FoldableArea>
      <FoldableArea alignContainerRight buttonContent='Register' primary style={{ marginLeft: '10px' }}>
        Register form
      </FoldableArea>
    </Styled.UserArea>
  );
}
