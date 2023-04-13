import { NODE_STATE } from 'persistance/editor/base-types';
import { useEditorStore } from '../../persistance/editor/editor-store';
import { getAllElementsUnderPointer } from '../utils/dom';
import { KEYS, SHIFT } from './keyboard';

export function onMouseDownHandler(event: MouseEvent): void {
  const store = useEditorStore.getState();
  const { pointer } = store;
  const highlight = store.getHighlightedNode();
  const selection = store.getSelectedNode();
  const target = event.target as HTMLElement;
  pointer.setDraggedId(target.id);
  const { id } = target;

  pointer.setIsLeftButtonDown(true);
  pointer.setWasShiftPressedOnDown(KEYS[SHIFT].isPressed);

  if (highlight && target && highlight.id === id) {
    store.saveChildrenRelativePosition(highlight.id);
    highlight.setPointerPositionDiff(pointer.position.x, pointer.position.y);

    store
      .getChildren(highlight.id, true)
      .forEach((child) => child.setPointerPositionDiff(pointer.position.x, pointer.position.y));

    return;
  }

  if (selection && target.id && id !== selection.id) {
    store.clearSelection();
  }
}

export function onMouseUpHandler(): void {
  const store = useEditorStore.getState();
  const { pointer } = store;
  const highlight = store.getHighlightedNode();
  const selection = store.getSelectedNode();
  pointer.setIsLeftButtonDown(false);

  if (highlight && highlight.isBeingDragged()) {
    const { parentId } = highlight;
    const { x, y } = pointer.position;
    const elementsUnderPointer = getAllElementsUnderPointer(x, y).filter(({ id }) => id !== highlight.id);
    const nodeUnderMouse = store.getNodeById(elementsUnderPointer[0]?.id ?? '');
    if (
      nodeUnderMouse &&
      nodeUnderMouse.id !== highlight.id &&
      !store.isParentOf(highlight.id, nodeUnderMouse.id, true) &&
      !store.isChildOf(nodeUnderMouse.id, highlight.id)
    ) {
      if (parentId) store.removeChildNode(parentId, highlight.id);
      store.addChildNode(nodeUnderMouse.id, highlight.id);
      store.resolveOverlaps(highlight, 'x');
      store.restoreChildrenRelativePosition(highlight.id);
      store.getChildren(highlight.id, true).forEach((child) => store.resolveOverlaps(child));
    }

    highlight.setState(NODE_STATE.SELECTED);
    if (!pointer.wasShiftPressedOnDown) store.restoreChildrenRelativePosition(highlight.id);
  }

  pointer.clearDraggedId();
  if (selection) selection.resetZIndex();
  setTimeout(() => {
    store.saveCurrentMindMapAsJSON();
  }, 100);
}
