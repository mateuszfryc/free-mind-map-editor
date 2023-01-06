import { THOUGHT_STATE } from 'types/baseTypes';
import { useMindMapStore } from './stores/store';

export class KeyData {
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

interface KeysInterface {
  [key: string]: KeyData;
}

const KEYS: KeysInterface = {
  [ENTER]: new KeyData(13, ENTER),
  [ESCAPE]: new KeyData(27, ESCAPE),
  [SHIFT]: new KeyData(16, SHIFT),
  [TAB]: new KeyData(9, TAB),
  [DELETE]: new KeyData(46, DELETE),
  [SPACE]: new KeyData(32, SPACE),
};

interface BindingsInterface {
  [key: string]: KeyData;
}

const KEYS_BINDINGS: BindingsInterface = {
  addChild: KEYS[TAB],
  addSibling: KEYS[ENTER],
  deleteSelected: KEYS[DELETE],
  edit: KEYS[SPACE],
  exitEditState: KEYS[ESCAPE],
};

export function onPressKeyHandler(event: KeyboardEvent): void {
  const store = useMindMapStore.getState();
  const { selection } = store;
  const { key, keyCode, shiftKey } = event;

  if (key) {
    if (KEYS[key]) {
      KEYS[key].isPressed = true;
    }
  } else if (keyCode) {
    const keysDataValues = Object.values(KEYS);
    const keyData = keysDataValues.find((keyItem) => keyItem.code === keyCode);
    if (keyData) keyData.isPressed = false;
  }

  KEYS[SHIFT].isPressed = shiftKey;
  store.setIsGroupDragOn(!KEYS[SHIFT].isPressed);

  if ((KEYS[ENTER].isPressed && selection !== undefined) || KEYS[TAB].isPressed) {
    event.preventDefault();
  }

  if (selection !== undefined) {
    const hasParent = selection.hasParent();

    // allow to navigate back to parent (select parent) by pressing shift + tab
    if (KEYS[SHIFT].isPressed) {
      if (KEYS[TAB].isPressed && selection.parent) {
        store.setSelection(selection.parent);
      }

      return;
    }
    if (KEYS_BINDINGS.addChild.isPressed) {
      store.createChildThought(selection);

      return;
    }
    if (KEYS_BINDINGS.addSibling.isPressed && hasParent) {
      store.createSiblingThought(selection);

      return;
    }
    if (selection.isEdited()) {
      if (KEYS_BINDINGS.exitEditState.isPressed) {
        store.stopEditing();
      }

      return;
    }
    if (KEYS_BINDINGS.deleteSelected.isPressed && !selection.isRootThought) {
      store.removeThought(selection);

      return;
    }
    if (KEYS_BINDINGS.edit.isPressed) {
      store.editSelection();
    }
  }
}

export function onReleaseKeyHandler(event: KeyboardEvent): void {
  const { key, keyCode, shiftKey } = event;

  if (key) {
    if (KEYS[key]) {
      KEYS[key].isPressed = false;
    }
  } else if (keyCode) {
    const keysDataValues = Object.values(KEYS);
    const keyData = keysDataValues.find((keyItem) => keyItem.code === keyCode);
    if (keyData) keyData.isPressed = false;
  }

  KEYS[SHIFT].isPressed = shiftKey;
  useMindMapStore.getState().setIsGroupDragOn(!KEYS[SHIFT].isPressed);
}

export function onMouseDownHandler(event: MouseEvent): void {
  const store = useMindMapStore.getState();
  const { pointer, highlight, selection } = store;
  const target = event.target as HTMLElement;
  pointer.setDraggedId(target.id);
  const id = parseInt(target.id, 10);

  pointer.setIsLeftButtonDown(true);
  pointer.setWasShiftPressedOnDown(KEYS[SHIFT].isPressed);

  if (highlight && target && highlight.id === id) {
    highlight.saveChildrenRelativePosition();
    highlight.setPointerPositionDiff(pointer.position.x, pointer.position.y);

    // if (highlight.isIdle() || (selection && selection.id !== highlight.id)) {
    //     store.setSelection(highlight);
    //     window.console.log('onMouseDownHandler', highlight.id);
    // }

    highlight
      .getChildren(true)
      .forEach((child) => child.setPointerPositionDiff(pointer.position.x, pointer.position.y));
  } else if (selection && target.id && parseInt(target.id, 10) !== selection.id) {
    store.clearSelection();
  }
}

export function onMouseUpHandler(): void {
  const store = useMindMapStore.getState();
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

  pointer.clearDraggedId();
  if (selection) selection.resetZIndex();
  setTimeout(() => {
    store.saveCurrentMindMapAsJSON();
  }, 100);
}

// export function onMouseMoveHandler(event: MouseEvent): void {
//     const { pointer } = useStore.getState();
//     pointer.lastPosition.x = pointer.position.x;
//     pointer.lastPosition.y = pointer.position.y;
//     pointer.position.x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
//     pointer.position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
// }
