import { useEffect } from 'react';

import { MiniMap } from 'components/MiniMap';
import { NodesContainer } from 'components/NodesContainer';
import { SingleNode } from 'components/SingleNode';
import * as Input from 'input';
import { useMindMapStore } from '../../stores/mind-map-store';
import { initializeSelector, nodesSelector, onMouseMoveSelector } from '../../stores/selectors';
import { EditorMenu } from '../EditorMenu';
import { Canvas, HelpButton, MindMapContainer } from './MindMap.styled';

export function MindMap() {
  const nodes = useMindMapStore(nodesSelector);
  const initialize = useMindMapStore(initializeSelector);
  const onMouseMove = useMindMapStore(onMouseMoveSelector);

  useEffect(() => {
    initialize();

    document.addEventListener('mousedown', Input.onMouseDownHandler);
    document.addEventListener('mouseup', Input.onMouseUpHandler);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', Input.onPressKeyHandler);
    document.addEventListener('keyup', Input.onReleaseKeyHandler);

    return () => {
      document.removeEventListener('mousedown', Input.onMouseDownHandler);
      document.removeEventListener('mouseup', Input.onMouseUpHandler);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', Input.onPressKeyHandler);
      document.removeEventListener('keyup', Input.onReleaseKeyHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MindMapContainer id='mindmap'>
      <EditorMenu />
      <Canvas />
      <NodesContainer>
        {nodes.map((node) => (
          <SingleNode key={node.id} node={node} />
        ))}
      </NodesContainer>
      <MiniMap />
      <HelpButton to='help'>How to use</HelpButton>
    </MindMapContainer>
  );
}
