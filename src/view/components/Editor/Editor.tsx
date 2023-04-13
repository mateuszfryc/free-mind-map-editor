import { useEffect } from 'react';

import { MiniMap } from 'view/components/MiniMap';
import { NodesContainer } from 'view/components/NodesContainer';
import { SingleNode } from 'view/components/SingleNode';
import * as KeyboardInput from 'view/input/keyboard';
import * as MouseInput from 'view/input/pointer';
import { editorStore } from '../../../persistance/editor/editor-store';
import { EditorMenu } from '../EditorMenu';
import { Canvas, HelpButton, MindMapContainer } from './Editor.styled';

export function Editor() {
  const nodes = editorStore.nodes();
  const initialize = editorStore.initialize();
  const onMouseMove = editorStore.onMouseMove();

  useEffect(() => {
    initialize();

    document.addEventListener('mousedown', MouseInput.onMouseDownHandler);
    document.addEventListener('mouseup', MouseInput.onMouseUpHandler);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', KeyboardInput.onPressKeyHandler);
    document.addEventListener('keyup', KeyboardInput.onReleaseKeyHandler);

    return () => {
      document.removeEventListener('mousedown', MouseInput.onMouseDownHandler);
      document.removeEventListener('mouseup', MouseInput.onMouseUpHandler);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', KeyboardInput.onPressKeyHandler);
      document.removeEventListener('keyup', KeyboardInput.onReleaseKeyHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MindMapContainer id='mindmap'>
      <EditorMenu />
      <Canvas id='canvas' />
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
