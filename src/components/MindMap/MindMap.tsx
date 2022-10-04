import React, { useEffect } from 'react';

import { MiniMap } from 'components/MiniMap';
import { SingleThought } from 'components/SingleThought';
import { ThoughtsContainer } from 'components/ThoughtsContainer';
import * as Input from 'input';
import * as Styled from './MindMap.styled';
import { initializeSelector, onMouseMoveSelector, thoughtsSelector, useStore } from '../../stores/store';

export const MindMap: React.FC = () => {
    const thoughts = useStore(thoughtsSelector);
    const initialize = useStore(initializeSelector);
    const onMouseMove = useStore(onMouseMoveSelector);

    useEffect(() => {
        initialize();

        document.addEventListener('mousedown', Input.onMouseDownHandler);
        document.addEventListener('mouseup', Input.onMouseUpHandler);
        // document.addEventListener('mousemove', Input.onMouseMoveHandler);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('keydown', Input.onPressKeyHandler);
        document.addEventListener('keyup', Input.onReleaseKeyHandler);

        return () => {
            document.removeEventListener('mousedown', Input.onMouseDownHandler);
            document.removeEventListener('mouseup', Input.onMouseUpHandler);
            // document.removeEventListener('mousemove', Input.onMouseMoveHandler);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('keydown', Input.onPressKeyHandler);
            document.removeEventListener('keyup', Input.onReleaseKeyHandler);
        };
    });

    return (
        <Styled.MindMap id='mindmap'>
            <Styled.Canvas />
            <ThoughtsContainer>
                {thoughts.map((thought) => (
                    <SingleThought key={thought.id} thought={thought} />
                ))}
            </ThoughtsContainer>
            <MiniMap />
        </Styled.MindMap>
    );
};
