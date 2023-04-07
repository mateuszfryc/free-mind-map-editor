import { useCallback, useRef, useState } from 'react';

import { getSafeRef } from 'utils/get';
import { useMindMapStore } from '../../stores/mind-map-store';
import { pointerSelector } from '../../stores/selectors';
import { view } from '../../stores/view';
import * as Styled from './MiniMap.styled';

export function MiniMap() {
  const pointer = useMindMapStore(pointerSelector);
  const miniMapRef = useRef(null);
  const viewportRef = useRef(null);
  const [canBeDragged, setCanBeDragged] = useState(false);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (!canBeDragged) return;

      const target = event.target as HTMLElement;
      const safeRefMap = getSafeRef(miniMapRef);
      const safeRefView = getSafeRef(viewportRef);

      if (pointer.isLeftButtonDown && target && miniMapRef && safeRefView && safeRefMap) {
        if (view && (safeRefMap.id === target.id || safeRefView.id === target.id)) {
          const { x, y } = pointer.getCurrentToLastPositionDiff();
          view.dragMinimapViewport(x, y);
        }
      }
    },
    [canBeDragged, pointer],
  );

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      // if there is drag action don't interact with the mini map
      if (pointer.draggedItemId) return;

      setCanBeDragged(true);

      const target = event.target as HTMLElement;
      const safeRefMap = getSafeRef(miniMapRef);
      const safeRefView = getSafeRef(viewportRef);
      if (target && miniMapRef && safeRefView && safeRefMap) {
        if (view && (safeRefMap.id === target.id || safeRefView.id === target.id)) {
          view.setMiniMapViewportToPointerPosition(pointer.position);
        }
      }
    },
    [pointer.draggedItemId, pointer.position],
  );

  const onMouseUp = useCallback(() => {
    setCanBeDragged(false);
  }, []);

  return (
    <Styled.MiniMap id='mini-map' ref={miniMapRef}>
      <Styled.MiniMapViewport
        id='mini-map__viewport'
        ref={viewportRef}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
    </Styled.MiniMap>
  );
}
