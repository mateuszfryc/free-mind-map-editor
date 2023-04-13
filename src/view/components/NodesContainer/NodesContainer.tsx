import { ReactNode, useEffect, useRef } from 'react';
import { editorStore } from '../../../persistance/editor/editor-store';
import { view } from '../../../persistance/editor/view';
import * as Styled from './NodesContainer.styled';

type NodesContainerProps = {
  children: ReactNode;
};

export function NodesContainer({ children }: NodesContainerProps) {
  const pointer = editorStore.pointer();
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
    <Styled.NodesContainer id='nodes-container' style={{ width: '4000px', height: '4000px' }} ref={ref}>
      {children}
    </Styled.NodesContainer>
  );
}
