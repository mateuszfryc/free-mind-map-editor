import { GlobalStore } from 'stores/globalStore';
import { THOUGHT_STATE } from 'types/baseTypes';

class KeyData {
    code: number;

    name: string;

    isPressed: boolean;

    constructor(code: number, name: string) {
        this.code = code;
        this.name = name;
        this.isPressed = false;
    }

    setState(event: KeyboardEvent) {
        this.isPressed = event.key === this.name || event.keyCode === this.code;
    }
}

const ENTER = 'Enter';
const ESCAPE = 'Escape';
const SHIFT = 'Shift';
const TAB = 'Tab';
const DELETE = 'Delete';
const SPACE = ' ';

interface keysInterface {
    [key: string]: KeyData;
}

const KEYS: keysInterface = {
    [ENTER]: new KeyData(13, ENTER),
    [ESCAPE]: new KeyData(27, ESCAPE),
    [SHIFT]: new KeyData(16, SHIFT),
    [TAB]: new KeyData(9, TAB),
    [DELETE]: new KeyData(46, DELETE),
    [SPACE]: new KeyData(32, SPACE),
};

interface bindingsInterface {
    [key: string]: KeyData;
}

const KEYS_BINDINGS: bindingsInterface = {
    addChild: KEYS[TAB],
    addSibling: KEYS[ENTER],
    deleteSelected: KEYS[DELETE],
    edit: KEYS[SPACE],
    exitEditState: KEYS[ESCAPE],
};

export function onPressKeyHandler(event: KeyboardEvent, store: GlobalStore): void {
    const { selection } = store;
    const { key, keyCode, shiftKey } = event;

    if (key) {
        if (KEYS[key]) {
            KEYS[key].isPressed = true;
        }
    } else if (keyCode) {
        Object.values(!KEYS).find((keyItem) => keyItem.code === keyCode).isPressed = false;
    }

    KEYS[SHIFT].isPressed = shiftKey;
    store.setIsGroupDraggOn(!KEYS[SHIFT].isPressed);

    if ((KEYS[ENTER].isPressed && selection !== undefined) || KEYS[TAB].isPressed) {
        event.preventDefault();
    }

    if (selection !== undefined) {
        const hasParent = selection.hasParent();

        // allow to navigate back to parent (select parent) by pressing shift + tab
        if (KEYS[SHIFT].isPressed) {
            if (KEYS[TAB].isPressed && hasParent) {
                store.setSelection(selection.parent!);
            }
        } else if (KEYS_BINDINGS.addChild.isPressed) {
            store.createChildThought(selection);
        } else if (KEYS_BINDINGS.addSibling.isPressed && hasParent) {
            store.createSiblingThought(selection);
        } else if (selection.isEdited()) {
            if (KEYS_BINDINGS.exitEditState.isPressed) {
                store.stopEditing();
            }
        } else if (KEYS_BINDINGS.deleteSelected.isPressed) {
            store.removeThought(selection);
        } else if (KEYS_BINDINGS.edit.isPressed) {
            store.editSelection();
        }
    }
}

export function onReleaseKeyHandler(event: KeyboardEvent, store: GlobalStore): void {
    const { key, keyCode, shiftKey } = event;

    if (key) {
        if (KEYS[key]) {
            KEYS[key].isPressed = false;
        }
    } else if (keyCode) {
        Object.values(!KEYS).find((keyItem) => keyItem.code === keyCode).isPressed = false;
    }

    KEYS[SHIFT].isPressed = shiftKey;
    store.setIsGroupDraggOn(!KEYS[SHIFT].isPressed);
}

export function onMouseDownHandler(event: MouseEvent, store: GlobalStore): void {
    const { pointer, highlight, selection } = store;
    const target = event.target as HTMLElement;
    pointer.setDraggedId(target.id);
    const id = parseInt(target.id, 10);
    pointer.setIsLeftButtonDown(true);
    pointer.setWasShiftPressedOnDown(KEYS[SHIFT].isPressed);

    if (highlight && target && highlight.id === id) {
        store.savePointerPositionDiff(highlight);
        highlight.saveChildrenRelativePosition();

        if (highlight.isIdle() || (selection && selection.id !== highlight.id)) {
            store.setSelection(highlight);
        }

        highlight.getChildren(true).forEach((child) => store.savePointerPositionDiff(child));
    } else if (selection && target.id && parseInt(target.id, 10) !== selection.id) {
        store.clearSelection();
    }
}

export function onMouseUpHandler(event: MouseEvent, store: GlobalStore): void {
    const { pointer, highlight, selection } = store;
    pointer.setIsLeftButtonDown(false);

    if (highlight && highlight.isBeingDragged()) {
        const { closestOverlap, parent } = highlight;
        if (closestOverlap && !highlight.isParentOf(closestOverlap, true) && !closestOverlap.isChildOf(highlight)) {
            if (parent) parent.removeChildThought(highlight);
            closestOverlap.addChildThought(highlight);
            store.resolveOverlaps(highlight, 'x').restoreChildrenRelativePosition();
            highlight.getChildren(true).forEach((child) => store.resolveOverlaps(child));
        }

        highlight.setState(THOUGHT_STATE.SELECTED);
        if (!pointer.wasShiftPressedOnDown) highlight.restoreChildrenRelativePosition();
    }
    store.draw();

    pointer.clearDraggedId();
    if (selection) selection.resetZIndex();
}

export function onMouseMoveHandler(event: MouseEvent, store: GlobalStore): void {
    const { pointer } = store;
    pointer.lastPosition.x = pointer.position.x;
    pointer.lastPosition.y = pointer.position.y;
    pointer.position.x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    pointer.position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
}
