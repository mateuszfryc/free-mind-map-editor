import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import { GlobalStore } from 'stores/globalStore';
import { getSafeRef } from 'utils/get';
import * as Styled from './MiniMap.styled';

type MiniMapProps = {
    store: GlobalStore;
};

export const MiniMap: React.FC<MiniMapProps> = observer(({ store }) => {
    const miniMapRef = useRef(null);
    const viewportRef = useRef(null);

    const onMouseMove = (event: MouseEvent): void => {
        const target = event.target as HTMLElement;
        const safeRefMap = getSafeRef(miniMapRef);
        const safeRefView = getSafeRef(viewportRef);
        if (store.pointer.isLeftButtonDown && target && miniMapRef && safeRefView) {
            if (store.view && (safeRefMap!.id === target.id || safeRefView.id === target.id)) {
                const { x, y } = store.pointer.getCurrentToLastPositionDiff();
                store.view.draggMinimapViewport(x, y);
                store.draw();
            }
        }
    };

    const onMouseDown = (event: MouseEvent): void => {
        const target = event.target as HTMLElement;
        const safeRefMap = getSafeRef(miniMapRef);
        const safeRefView = getSafeRef(viewportRef);
        if (target && miniMapRef && safeRefView) {
            if (store.view && (safeRefMap!.id === target.id || safeRefView.id === target.id)) {
                store.view.setMiniMapViepowrtToPointerPosition(store.pointer.position);
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
        <Styled.MiniMap id="mini-map" ref={miniMapRef}>
            <Styled.MiniMapViewport id="mini-map__viewport" ref={viewportRef} />
        </Styled.MiniMap>
    );
});
