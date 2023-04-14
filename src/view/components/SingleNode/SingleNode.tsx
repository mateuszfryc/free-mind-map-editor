import { ChangeEvent, useCallback, useEffect, useRef } from 'react';

import { Idea } from 'persistance/editor/idea';
import { getSafeRef } from 'view/utils/get';
import { editorStore } from '../../../persistance/editor/editor-store';
import * as Styled from './SingleNode.styled';

type NodeProps = {
  node: Idea;
};

export function SingleNode({ node }: NodeProps) {
  const setHighlight = editorStore.setHighlight();
  const clearHighlight = editorStore.clearHighlight();
  const setSelection = editorStore.setSelection();
  const editSelection = editorStore.editSelection();
  const getSelectedNode = editorStore.getSelectedNode();
  const maxNodeWidth = editorStore.maxNodeWidth();
  const updateSelectionContent = editorStore.updateSelectionContent();
  const pointer = editorStore.pointer();

  const contentRef = useRef(null);
  const isSelected = node.isIdle && !node.isIdle();
  const isEdited = node.isEdited && node.isEdited();

  const updateContent = useCallback(
    (event: ChangeEvent): void => {
      const textareaSafeRef = getSafeRef(contentRef);
      if (textareaSafeRef) {
        const { value } = event.target as HTMLTextAreaElement;

        updateSelectionContent(value ?? '');

        window.setTimeout(() => {
          textareaSafeRef.style.width = `${node.getOuterWidth()}px`;
          textareaSafeRef.style.height = `${node.getHeight()}px`;
          node.refreshPosition();
        }, 0);
      }
    },
    [node, updateSelectionContent],
  );

  useEffect(() => {
    if (node.isEdited && node.isEdited()) {
      const textareaSafeRef = getSafeRef<HTMLTextAreaElement>(contentRef);
      if (textareaSafeRef) {
        textareaSafeRef.style.width = `${node.getWidth() + 2}px`;
        textareaSafeRef.style.height = `${node.getHeight()}px`;
        textareaSafeRef.select();
      }
    }
  }, [node, node.state]);

  const onMouseEnter = useCallback((): void => {
    if (!pointer.isAnyButtonPressed) {
      setHighlight(node.id);
    }
  }, [pointer.isAnyButtonPressed, setHighlight, node]);

  const onMouseLeave = useCallback((): void => {
    if (!pointer.isAnyButtonPressed) {
      clearHighlight();
    }
  }, [clearHighlight, pointer.isAnyButtonPressed]);

  const onMouseDown = useCallback(() => {
    const selection = getSelectedNode();
    if (!selection || selection.id !== node.id) {
      setSelection(node.id);
    }
  }, [getSelectedNode, node.id, setSelection]);

  return (
    <Styled.Node
      fontSize={node.isRootNode ? 'itemTitle' : 'normal'}
      id={`${node.id}`}
      isEdited={isEdited}
      isSelected={isSelected}
      maxWidth={maxNodeWidth}
      onDoubleClick={editSelection}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      zIndex={node.zIndex}
    >
      {node.content}
      {isEdited && <Styled.Textarea id={`${node.id}`} onChange={updateContent} ref={contentRef} value={node.content} />}
    </Styled.Node>
  );
}
