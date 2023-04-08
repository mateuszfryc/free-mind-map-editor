import { ChangeEvent, useCallback, useEffect, useRef } from 'react';

import { Node } from 'stores/Node';
import { getSafeRef } from 'utils/get';
import { useMindMapStore, useSelection } from '../../stores/mind-map-store';
import {
  clearHighlightSelector,
  initialNodeWidthSelector,
  pointerSelector,
  setHighlightSelector,
  updateSelectionContentSelector,
} from '../../stores/selectors';
import * as Styled from './SingleNode.styled';

type NodeProps = {
  node: Node;
};

export function SingleNode({ node }: NodeProps) {
  const pointer = useMindMapStore(pointerSelector);
  const [selection, setSelection, editSelection] = useSelection();
  const updateSelectionContent = useMindMapStore(updateSelectionContentSelector);
  const setHighlight = useMindMapStore(setHighlightSelector);
  const clearHighlight = useMindMapStore(clearHighlightSelector);
  const initialNodeWidth = useMindMapStore(initialNodeWidthSelector);

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
    if (!pointer.isLeftButtonDown) {
      setHighlight(node.id);
    }
  }, [pointer.isLeftButtonDown, setHighlight, node]);

  const onMouseLeave = useCallback((): void => {
    if (!pointer.isLeftButtonDown) {
      clearHighlight();
    }
  }, [clearHighlight, pointer.isLeftButtonDown]);

  const onMouseDown = useCallback(() => {
    if (!selection || selection.id !== node.id) {
      setSelection(node.id);
    }
  }, [selection, setSelection, node]);

  return (
    <Styled.Node
      fontSize={node.isRootNode ? 'root' : 'node'}
      id={`${node.id}`}
      isEdited={isEdited}
      isSelected={isSelected}
      maxWidth={initialNodeWidth}
      onDoubleClick={editSelection}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      zIndex={node.zIndex}
    >
      <div className='underline' id={`${node.id}`} />
      {node.content}
      {isEdited && <Styled.Textarea id={`${node.id}`} onChange={updateContent} ref={contentRef} value={node.content} />}
    </Styled.Node>
  );
}
