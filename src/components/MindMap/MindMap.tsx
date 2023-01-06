import { useEffect } from 'react';

import { MiniMap } from 'components/MiniMap';
import { SingleThought } from 'components/SingleThought';
import { ThoughtsContainer } from 'components/ThoughtsContainer';
import * as Input from 'input';
import { initializeSelector, onMouseMoveSelector, thoughtsSelector, useMindMapStore } from '../../stores/store';
import * as Styled from './MindMap.styled';

export function MindMap() {
  const thoughts = useMindMapStore(thoughtsSelector);
  const initialize = useMindMapStore(initializeSelector);
  const onMouseMove = useMindMapStore(onMouseMoveSelector);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
}
