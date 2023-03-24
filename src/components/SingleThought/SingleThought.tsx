import { ChangeEvent, useCallback, useEffect, useRef } from 'react';

import { Thought } from 'stores/Thought';
import { getSafeRef } from 'utils/get';
import { useMindMapStore, useSelection } from '../../stores/mind-map-store';
import {
  clearHighlightSelector,
  initialThoughtWidthSelector,
  pointerSelector,
  setHighlightSelector,
  updateSelectionContentSelector,
} from '../../stores/selectors';
import * as Styled from './SingleThought.styled';

type ThoughtProps = {
  thought: Thought;
};

export function SingleThought({ thought }: ThoughtProps) {
  const pointer = useMindMapStore(pointerSelector);
  const [selection, setSelection, editSelection] = useSelection();
  const updateSelectionContent = useMindMapStore(updateSelectionContentSelector);
  const setHighlight = useMindMapStore(setHighlightSelector);
  const clearHighlight = useMindMapStore(clearHighlightSelector);
  const initialThoughtWidth = useMindMapStore(initialThoughtWidthSelector);

  const contentRef = useRef(null);
  const isSelected = thought.isIdle && !thought.isIdle();
  const isEdited = thought.isEdited && thought.isEdited();

  const updateContent = useCallback(
    (event: ChangeEvent): void => {
      const textareaSafeRef = getSafeRef(contentRef);
      if (textareaSafeRef) {
        textareaSafeRef.style.overflow = 'hidden';
        const { value } = event.target as HTMLTextAreaElement;
        if (!value) {
          return;
        }
        updateSelectionContent(value);

        window.setTimeout(() => {
          textareaSafeRef.style.width = `${thought.getWidth()}px`;
          textareaSafeRef.style.height = `${thought.getHeight()}px`;
          textareaSafeRef.style.overflow = 'visible';
          thought.refreshPosition();
        }, 5);
      }
    },
    [thought, updateSelectionContent],
  );

  useEffect(() => {
    if (thought.isEdited && thought.isEdited()) {
      const textareaSafeRef = getSafeRef<HTMLTextAreaElement>(contentRef);
      if (textareaSafeRef) {
        textareaSafeRef.style.width = `${thought.getWidth() + 2}px`;
        textareaSafeRef.style.height = `${thought.getHeight()}px`;
        textareaSafeRef.select();
      }
    }
  }, [thought, thought.state]);

  const onMouseEnter = useCallback((): void => {
    if (!pointer.isLeftButtonDown) {
      setHighlight(thought.id);
    }
  }, [pointer.isLeftButtonDown, setHighlight, thought]);

  const onMouseLeave = useCallback((): void => {
    if (!pointer.isLeftButtonDown) {
      clearHighlight();
    }
  }, [clearHighlight, pointer.isLeftButtonDown]);

  const onMouseDown = useCallback(() => {
    if (!selection || selection.id !== thought.id) {
      setSelection(thought.id);
    }
  }, [selection, setSelection, thought]);

  return (
    <Styled.Thought
      id={`${thought.id}`}
      isEdited={isEdited}
      isSelected={isSelected}
      maxWidth={initialThoughtWidth}
      onDoubleClick={editSelection}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      zIndex={thought.zIndex}
    >
      <div className='underline' id={`${thought.id}`} />
      {thought.content}
      {isEdited && (
        <Styled.Textarea id={`${thought.id}`} onChange={updateContent} ref={contentRef} value={thought.content} />
      )}
    </Styled.Thought>
  );
}
