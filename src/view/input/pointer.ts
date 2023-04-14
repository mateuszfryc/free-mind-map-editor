import { ChildPositionData, NODE_STATE } from 'persistance/editor/base-types';
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

  pointer.setisAnyButtonPressed(true);
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
  pointer.setisAnyButtonPressed(false);

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

export function onMouseMove(event: MouseEvent): void {
  const store = useEditorStore.getState();
  const selection = store.getSelectedNode();
  const { pointer: mouse } = store;

  mouse.lastPosition.x = mouse.position.x;
  mouse.lastPosition.y = mouse.position.y;
  mouse.position.x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
  mouse.position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

  const selectionCanBeDragged =
    mouse.isAnyButtonPressed &&
    selection &&
    selection.id === mouse.draggedItemId &&
    selection.state !== NODE_STATE.EDITED;

  if (selectionCanBeDragged) {
    const { x, y } = mouse.position;
    store.findClosestOverlapFor(selection);
    selection.setState(NODE_STATE.DRAGGED);
    selection.setOnTop();
    selection.setPosition({
      x: x + selection.diffX,
      y: y + selection.diffY,
    });

    const canDragSelectionChildren = store.isGroupDragOn && selection.hasChildren();
    const isParentOnLeft = store.isParentOnLeft(selection.id);
    if (!canDragSelectionChildren) {
      selection.setPrevIsParentOnLeft(isParentOnLeft);
    } else {
      if (!selection.isRootNode && isParentOnLeft !== selection.prevIsParentOnLeft) {
        selection.childrenRelativePosition.forEach((_: ChildPositionData, index: number): void => {
          const positionData = selection.childrenRelativePosition[index];
          positionData.position.x *= -1; // eslint-disable-line no-param-reassign
        });
      }
      store.restoreChildrenRelativePosition(selection.id);
      selection.setPrevIsParentOnLeft(isParentOnLeft);
    }
  }
}
