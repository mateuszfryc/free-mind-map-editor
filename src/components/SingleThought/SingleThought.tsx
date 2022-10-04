import React, { ChangeEvent, useCallback, useEffect, useRef } from 'react';

import { Thought } from 'classes/Thought';
import { getSafeRef } from 'utils/get';
import * as Styled from './SingleThought.styled';
import {
    useStore,
    pointerSelector,
    useSelection,
    updateSelectionContentSelector,
    setHighlightSelector,
    clearHighlightSelector,
    initialThoughtWidthSelector,
} from '../../stores/store';

type ThoughtProps = {
    thought: Thought;
};

export const SingleThought: React.FC<ThoughtProps> = ({ thought }) => {
    const pointer = useStore(pointerSelector);
    const [selection, setSelection, editSelection] = useSelection();
    const updateSelectionContent = useStore(updateSelectionContentSelector);
    const setHighlight = useStore(setHighlightSelector);
    const clearHighlight = useStore(clearHighlightSelector);
    const initialThoughtWidth = useStore(initialThoughtWidthSelector);

    const wrapper = useRef(null);
    const contentRef = useRef(null);
    const isSelected = !thought.isIdle();
    const isEdited = thought.isEdited();

    const updateContent = (event: ChangeEvent): void => {
        const textareaSafeRef = getSafeRef(contentRef);
        if (textareaSafeRef) {
            textareaSafeRef.style.overflow = 'hidden';
            const { value } = event.target as HTMLTextAreaElement;
            updateSelectionContent(value);

            window.setTimeout(() => {
                textareaSafeRef.style.width = `${thought.getWidth()}px`;
                textareaSafeRef.style.height = `${thought.getHeight()}px`;
                textareaSafeRef.style.overflow = 'visible';
                thought.refreshPosition();
            }, 5);
        }
    };

    useEffect(() => {
        if (thought.isEdited()) {
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
            setHighlight(thought);
        }
    }, [pointer.isLeftButtonDown, setHighlight, thought]);

    const onMouseLeave = useCallback((): void => {
        if (!pointer.isLeftButtonDown) {
            clearHighlight();
        }
    }, [clearHighlight, pointer.isLeftButtonDown]);

    const onMouseDown = useCallback(() => {
        if (!selection || selection.id !== thought.id) {
            setSelection(thought);
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
            ref={wrapper}
            zIndex={thought.zIndex}
        >
            <div className='underline' id={`${thought.id}`} />
            {thought.content}
            {thought.isEdited() && (
                <Styled.Textarea
                    id={`${thought.id}`}
                    onChange={updateContent}
                    ref={contentRef}
                    value={thought.content}
                />
            )}
        </Styled.Thought>
    );
};
