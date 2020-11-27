import React, { FC, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import { GlobalStore } from 'stores/globalStore';
import * as Styled from './ThoughtsContainer.styled';

type ThoughtsContainerProps = {
    store: GlobalStore;
};

export const ThoughtsContainer: FC<ThoughtsContainerProps> = observer(({ store, children }) => {
    const ref = useRef(null);

    const onMouseMove = (): void => {
        if (store.pointer.isLeftButtonDown) {
            if (ref && ref.current) {
                const safeRef = ref.current! as HTMLElement;
                if (store.view && ref.current && safeRef.id === store.pointer.draggedItemId) {
                    const { x, y } = store.pointer.getCurrentToLastPositionDiff();
                    store.view.setMapPosition(x, y);
                    store.draw();
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
        <Styled.ThoughtsContainer id="thoughts-container" style={{ width: '4000px', height: '4000px' }} ref={ref}>
            {children}
        </Styled.ThoughtsContainer>
    );
});
