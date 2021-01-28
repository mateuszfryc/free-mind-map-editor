import React, { ChangeEvent, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import storeContext from 'stores/globalStore';
import { Thought } from 'classes/Thought';
import { THOUGHT_STATE, childPositionData } from 'types/baseTypes';
import { getSafeRef } from 'utils/get';
import * as Styled from './SingleThought.styled';

type ThoughtProps = {
    thought: Thought;
};

export const SingleThought: React.FC<ThoughtProps> = observer(({ thought }) => {
    const store = useContext(storeContext);
    const wrapper = useRef(null);
    const contentRef = useRef(null);
    const isSelected = !thought.isIdle();
    const isEdited = thought.isEdited();
    const startEditing = (): void => {
        store.editSelection();
    };

    const updateContent = (event: ChangeEvent): void => {
        const textareaSafeRef = getSafeRef(contentRef);
        if (textareaSafeRef) {
            textareaSafeRef.style.overflow = 'hidden';
            const { value } = event.target as HTMLTextAreaElement;
            store.updateSelectionContent(value);

            window.setTimeout(() => {
                textareaSafeRef.style.width = `${thought.getWidth()}px`;
                textareaSafeRef.style.height = `${thought.getHeight()}px`;
                textareaSafeRef.style.overflow = 'visible';
                thought.refreshPosition();
            }, 5);
        }
    };

    const onMouseMove = (): void => {
        const safeRef = getSafeRef(wrapper);
        const { selection } = store;
        if (
            store.pointer.isLeftButtonDown &&
            store.view &&
            selection &&
            safeRef &&
            safeRef.id === store.pointer.draggedItemId
        ) {
            const { x, y } = store.pointer.position;
            store.findClosestOverlapFor(selection);
            selection.setState(THOUGHT_STATE.DRAGGED);
            selection.setOnTop();
            selection.setPosition({
                x: x + selection.diffX,
                y: y + selection.diffY,
            });
            if (store.isGroupDraggOn && thought.hasChildren()) {
                const isParentOnLeft = thought.isParentOnLeft();
                if (!selection.isRootThought && isParentOnLeft !== selection.prevIsParentOnLeft) {
                    selection.childrenRelativePosition.forEach((data: childPositionData, index: number): void => {
                        selection.childrenRelativePosition[index].position.x *= -1; // eslint-disable-line no-param-reassign
                    });
                }
                selection.restoreChildrenRelativePosition();
                selection.setPrevIsParentOnLeft(isParentOnLeft);
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const onMouseEnter = (): void => {
        if (!store.pointer.isLeftButtonDown) {
            store.setHighlight(thought);
        }
    };

    const onMouseLeave = (): void => {
        if (!store.pointer.isLeftButtonDown) {
            store.clearHighlight();
        }
    };

    return (
        <Styled.Thought
            id={`${thought.id}`}
            isEdited={isEdited}
            isSelected={isSelected}
            maxWidth={store.initialThoughtWidth}
            onDoubleClick={startEditing}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            ref={wrapper}
            zIndex={thought.zIndex}
        >
            <div className='underline' id={`${thought.id}`} />
            {thought.content}
            {thought.isEdited() && (
                <Styled.Textarea onChange={updateContent} ref={contentRef} value={thought.content} />
            )}
        </Styled.Thought>
    );
});
