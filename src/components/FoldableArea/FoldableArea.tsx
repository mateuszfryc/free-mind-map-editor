import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Button } from '../Button';
import * as Styled from './FoldableArea.styled';

type ChildContext = { closeMenu?: () => void; isOpen?: boolean };
const ChildrenContext = createContext<ChildContext>({});

type ChildProps = React.PropsWithChildren<{
  onClick?: () => void;
  onCLickClose?: boolean;
  isOpen?: boolean;
  style?: React.CSSProperties;
}>;

export function Child({ children, onClick = undefined, onCLickClose = undefined, style = {} }: ChildProps) {
  const childContext = useContext(ChildrenContext);

  const onClickInner = useCallback(() => {
    onClick?.();
    if (onCLickClose) childContext.closeMenu?.();
  }, [childContext, onCLickClose, onClick]);

  return (
    <div style={style} onClick={onClickInner}>
      {children}
    </div>
  );
}

type Props = React.PropsWithChildren<{
  buttonContent?: React.ReactNode;
  primary?: boolean;
  alignContainerRight?: boolean;
  onChildrenClickWillCLose?: boolean;
  style?: React.CSSProperties;
  onClose?: () => void;
}>;

function FoldableArea({
  buttonContent = undefined,
  primary = false,
  alignContainerRight = false,
  children,
  style = undefined,
  onClose = undefined,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggleuserForm = useCallback(() => {
    setIsOpen((current) => {
      onClose?.();
      return !current;
    });
  }, [onClose]);

  const closeMenu = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      onClose?.();
    }
  }, [isOpen, onClose]);

  useOnClickOutside(containerRef, closeMenu);

  return (
    <ChildrenContext.Provider value={{ closeMenu, isOpen }}>
      <Styled.Wrapper ref={containerRef} style={style}>
        <Button onClick={toggleuserForm} primary={primary} type='button'>
          {buttonContent}
        </Button>
        <Styled.Container isOpen={isOpen} alignRight={alignContainerRight}>
          {children}
        </Styled.Container>
      </Styled.Wrapper>
    </ChildrenContext.Provider>
  );
}

FoldableArea.Child = Child;

export { FoldableArea };
