import { useEffect, useRef } from 'react';

import { getSafeRef } from 'utils/get';
import { pointerSelector, useMindMapStore, viewSelector } from '../../stores/store';
import * as Styled from './MiniMap.styled';

export function MiniMap() {
  const pointer = useMindMapStore(pointerSelector);
  const view = useMindMapStore(viewSelector);
  const miniMapRef = useRef(null);
  const viewportRef = useRef(null);

  const onMouseMove = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const safeRefMap = getSafeRef(miniMapRef);
    const safeRefView = getSafeRef(viewportRef);

    if (pointer.isLeftButtonDown && target && miniMapRef && safeRefView && safeRefMap) {
      if (view && (safeRefMap.id === target.id || safeRefView.id === target.id)) {
        const { x, y } = pointer.getCurrentToLastPositionDiff();
        view.dragMinimapViewport(x, y);
      }
    }
  };

  const onMouseDown = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const safeRefMap = getSafeRef(miniMapRef);
    const safeRefView = getSafeRef(viewportRef);
    if (target && miniMapRef && safeRefView && safeRefMap) {
      if (view && (safeRefMap.id === target.id || safeRefView.id === target.id)) {
        view.setMiniMapViewportToPointerPosition(pointer.position);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
    };
  });

  return (
    <Styled.MiniMap id='mini-map' ref={miniMapRef}>
      <Styled.MiniMapViewport id='mini-map__viewport' ref={viewportRef} />
    </Styled.MiniMap>
  );
}
