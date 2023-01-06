import { ReactNode, useEffect, useRef } from 'react';
import { pointerSelector, useMindMapStore, viewSelector } from '../../stores/store';
import * as Styled from './ThoughtsContainer.styled';

type ThoughtsContainerProps = {
  children: ReactNode;
};

export function ThoughtsContainer({ children }: ThoughtsContainerProps) {
  const pointer = useMindMapStore(pointerSelector);
  const view = useMindMapStore(viewSelector);
  const ref = useRef(null);

  const onMouseMove = (): void => {
    if (pointer.isLeftButtonDown) {
      if (ref && ref.current) {
        const safeRef = ref.current as HTMLElement;
        if (view && ref.current && safeRef.id === pointer.draggedItemId) {
          const { x, y } = pointer.getCurrentToLastPositionDiff();
          view.setMapPosition(x, y);
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  });

  return (
    <Styled.ThoughtsContainer id='thoughts-container' style={{ width: '4000px', height: '4000px' }} ref={ref}>
      {children}
    </Styled.ThoughtsContainer>
  );
}
