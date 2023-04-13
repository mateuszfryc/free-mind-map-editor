import { useEditorStore } from '../../persistance/editor/editor-store';

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

export const ENTER = 'Enter';
export const ESCAPE = 'Escape';
export const SHIFT = 'Shift';
export const TAB = 'Tab';
export const DELETE = 'Delete';
export const SPACE = ' ';

interface KeysInterface {
  [key: string]: KeyData;
}

export const KEYS: KeysInterface = {
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
  const store = useEditorStore.getState();
  const selection = store.getSelectedNode();
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

  if (!selection) return;

  const hasParent = selection.hasParent();

  // allow to navigate back to parent (select parent) by pressing shift + tab
  if (KEYS[SHIFT].isPressed) {
    if (KEYS[TAB].isPressed && selection.parentId !== undefined) {
      const parent = store.getNodeById(selection.parentId);
      if (parent) {
        store.setSelection(parent.id);
      }
    }

    return;
  }

  if (KEYS_BINDINGS.addChild.isPressed) {
    store.createChildNode(selection);

    return;
  }

  if (KEYS_BINDINGS.addSibling.isPressed && hasParent) {
    store.createSiblingNode(selection);

    return;
  }

  if (selection.isEdited()) {
    if (KEYS_BINDINGS.exitEditState.isPressed) {
      store.stopEditing(true);
    }

    return;
  }

  if (KEYS_BINDINGS.deleteSelected.isPressed && !selection.isRootNode) {
    store.removeNode(selection.id);

    return;
  }

  if (KEYS_BINDINGS.edit.isPressed) {
    store.editSelection();
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
  useEditorStore.getState().setIsGroupDragOn(!KEYS[SHIFT].isPressed);
}
