import styled, { css } from 'styled-components';

type OverlayProps = { isOpen?: boolean };
const Overlay = styled('div')<OverlayProps>(
  ({ isOpen = false }) => css`
    position: fixed;
    z-index: 10;
    display: ${isOpen ? 'flex' : 'none'};
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
  `,
);

const Container = styled.div(
  ({ theme: { colors, borderRadius } }) => css`
    padding: 20px;
    background-color: ${colors.primary()};
    border-radius: ${borderRadius}px;
    box-shadow: 0 0 15px ${colors.secondary(0.3)};
  `,
);

type ModalProps = React.PropsWithChildren<{
  isOpen?: boolean;
}>;

export function Modal({ children, isOpen = false }: ModalProps) {
  return (
    <Overlay isOpen={isOpen}>
      <Container>{children}</Container>
    </Overlay>
  );
}
