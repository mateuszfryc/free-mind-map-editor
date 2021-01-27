import React, { useEffect, useContext } from 'react';
import { observer } from 'mobx-react';

import storeContext from 'stores/globalStore';
import { MiniMap } from 'components/MiniMap';
import { ThoughtElement } from 'components/ThoughtElement';
import { ThoughtsContainer } from 'components/ThoughtsContainer';
import * as Input from 'input';
import * as Styled from './MindMap.styled';

export const MindMap: React.FC = observer(() => {
    const store = useContext(storeContext);

    const onMouseDown = (event: MouseEvent): void => {
        Input.onMouseDownHandler(event, store);
    };
    const onMouseUp = (event: MouseEvent): void => {
        Input.onMouseUpHandler(event, store);
    };
    const onMouseMove = (event: MouseEvent): void => {
        Input.onMouseMoveHandler(event, store);
    };
    const onPressKey = (event: KeyboardEvent): void => {
        Input.onPressKeyHandler(event, store);
    };
    const onReleaseKey = (event: KeyboardEvent): void => {
        Input.onReleaseKeyHandler(event, store);
    };

    useEffect(() => {
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('keydown', onPressKey);
        document.addEventListener('keyup', onReleaseKey);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('keydown', onPressKey);
            document.removeEventListener('keyup', onReleaseKey);
        };
    });

    return (
        <Styled.MindMap id="mindmap">
            <Styled.Canvas />
            <ThoughtsContainer store={store}>
                {store.thoughts.map((thought) => (
                    <ThoughtElement key={thought.id} thought={thought} />
                ))}
            </ThoughtsContainer>
            <MiniMap store={store} />
        </Styled.MindMap>
    );
});
