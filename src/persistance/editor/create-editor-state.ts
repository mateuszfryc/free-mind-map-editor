import { v4 as uuidv4 } from 'uuid';
import { draw } from '../../shared/draw';
import { view } from '../../shared/view';
import { awaitCondition } from '../../utils';
import { getTwoPointsDistance, getWindowInnerSize } from '../../view/utils/get';
import {
  ChildPositionData,
  NODE_STATE,
  ObjectOfVectors,
  SavedNodeStateType,
  SavedStateType,
  Vector,
} from './base-types';
import { editorDefaultState } from './data/default-state';
import { Get, OverlapResult, Set, TEditorStore } from './editor-type';
import { Idea } from './idea';
import { pointerBase } from './pointer';

export const createEditorState = (set: Set, get: Get): TEditorStore => {
  const maxSteps = 100;
  let count = 0;

  return {
    ...editorDefaultState,
    pointer: pointerBase,

    async initialize(): Promise<void> {
      const store = get();
      if (store.isInitialized) return;
      set({ isInitialized: true });

      await awaitCondition(() => view.setReferences(), 0);
      draw.setRoughCanvas(view.canvas!);

      window.addEventListener('resize', store.updateWorkspaceSize.bind(store));
      store.updateWorkspaceSize();
      view.setNodesContainerPosition();
      const root = store.rootNode;
      store.setSelection(root.id);
      //   store.editSelection();
      store.initPositions();
      view.centerOnNode(store.rootNode);
      store.cancelDrawLoop();
      store.startDrawLoop();
    },

    getNewID(): string {
      return uuidv4();
    },

    startDrawLoop(): void {
      const drawLoop = (): void => {
        const currentStore = get();
        if (!currentStore.isDrawingLocked) {
          draw.mindMap(
            view,
            currentStore.nodes,
            currentStore.connectorsCurveDividerWidth,
            currentStore.highlightId,
            currentStore.selectionId,
          );
        }
        set({
          drawLoopRafId: requestAnimationFrame(drawLoop),
        });
      };
      drawLoop();
    },

    cancelDrawLoop(): void {
      const store = get();
      if (store.drawLoopRafId) cancelAnimationFrame(store.drawLoopRafId);
      set({
        drawLoopRafId: undefined,
      });
    },

    addNode(position: Vector, isRoot?: boolean, parentId?: string, initText?: string, existingId?: string): Idea {
      const store = get();

      const node = new Idea(existingId ?? store.getNewID(), position, parentId, isRoot, initText);
      store.updateSingleItem(node);
      if (isRoot) {
        set(() => ({ rootNode: node }));
      }

      store.setPositionAsync(node.id, position);

      return node;
    },

    postNewThoughActions(newItem: Idea): void {
      const store = get();

      const isFullyWithinViewport = !newItem.isFullyWithinViewport();
      if (!isFullyWithinViewport) {
        const offset = newItem.getViewportOffset();
        view.setMapPosition(-offset.x + Math.sign(-offset.x) * 20, -offset.y + Math.sign(-offset.y) * 20);
      }
      store.editSelection();
      store.saveCurrentMindMapAsJSON();
    },

    getNodeById(id: string): Idea | undefined {
      const store = get();

      return store.nodes.find((t) => t.id === id);
    },

    addChildNode(newParentId: string, childId: string): void {
      const store = get();

      const newParent = store.getNodeById(newParentId);
      if (!newParent) return;

      const child = store.getNodeById(childId);
      if (!child) return;

      if (newParent.children.every((existingChildId) => existingChildId !== child.id)) {
        newParent.children.push(child.id);
        child.setParent(newParent.id);
      }
    },

    saveChildrenRelativePosition(id: string): void {
      const store = get();

      const node = store.getNodeById(id);

      if (!node || node.children.length < 1) return;

      const myPosition = node.getPosition();
      node.childrenRelativePosition = store.getChildren(node.id, true).map((child: Idea): ChildPositionData => {
        let { x, y } = child.getPosition();
        x -= myPosition.x;
        y -= myPosition.y;

        return { position: { x, y }, id: child.id };
      });
    },

    restoreChildrenRelativePosition(id: string): void {
      const store = get();
      const node = store.getNodeById(id);
      if (!node || node.children.length < 1) return;

      const myPosition = node.getPosition();
      const allChildren = store.getChildren(node.id, true);
      node.childrenRelativePosition.forEach((positionData): void => {
        const actionedChild = allChildren.find((child) => child.id === positionData.id);
        if (actionedChild) {
          actionedChild.setPosition({
            x: myPosition.x + positionData.position.x,
            y: myPosition.y + positionData.position.y,
          });
        }
      });
    },

    createChildNode(parent: Idea): void {
      const store = get();
      store.stopEditing();

      if (store.selectionId === undefined) return;

      const targetPosition: Vector = parent.getPosition();
      const sideMod = parent.hasParent() && !store.isParentOnLeft(parent.id) ? -1 : 1;
      targetPosition.x +=
        (parent.getOuterWidth() * 0.5 + store.initialNodeWidth * 0.5 + store.defaultSpawnGap.x) * sideMod;

      const newChild: Idea = store.addNode(targetPosition, false, parent.id);
      parent.children.push(newChild.id);

      store.setSelection(newChild.id);
      store.resolveOverlaps(newChild);
      newChild.refreshPosition();
      store.saveChildrenRelativePosition(parent.id);

      setTimeout(() => {
        store.postNewThoughActions(newChild);
      }, 100);
    },

    createSiblingNode(sibling: Idea): void {
      const store = get();
      store.stopEditing();

      if (store.selectionId === undefined) return;

      const targetPosition: Vector = sibling.getPosition();
      targetPosition.y += sibling.getOuterHeight() * 0.5 + 30 + store.defaultSpawnGap.y;
      const newSibling: Idea = store.addNode(targetPosition, false, sibling.parentId);

      if (sibling.parentId !== undefined) store.addChildNode(sibling.parentId, newSibling.id);

      store.setSelection(newSibling.id);
      store.resolveOverlaps(newSibling);
      newSibling.refreshPosition();

      if (sibling.parentId !== undefined) store.saveChildrenRelativePosition(sibling.parentId);

      setTimeout(() => {
        store.postNewThoughActions(newSibling);
      }, 100);
    },

    removeNode(nodeId: string): void {
      const store = get();
      const node = store.getNodeById(nodeId);
      if (!node) return;

      node.markForRemoval();

      if (node.parentId !== undefined) {
        store.removeChildNode(node.parentId, nodeId);
      }
      if (store.highlightId === nodeId) {
        set(() => ({ highlightId: undefined }));
      }
      if (store.selectionId === nodeId) {
        set(() => ({ selectionId: undefined }));
      }

      set((state) => ({
        nodes: [...state.nodes.filter((item: Idea) => item.id !== nodeId)],
      }));
      node.children.forEach((childId) => {
        store.removeNode(childId);
      });

      store.saveCurrentMindMapAsJSON();
    },

    removeChildNode(parentId: string, childToBeRemovedId: string): void {
      const store = get();
      const parent = store.getNodeById(parentId);
      if (!parent) return;

      parent.children = parent.children.filter((childId) => childId !== childToBeRemovedId);
      parent.childrenRelativePosition = parent.childrenRelativePosition.filter(
        (position) => position.id !== childToBeRemovedId,
      );

      const child = store.getNodeById(childToBeRemovedId);
      if (!child) return;
      child.clearParent();
    },

    isParentOf(parentId: string, unknownChildId: string, includeGrandChildren = false): boolean {
      const store = get();
      const child = store.getNodeById(unknownChildId);
      if (!child) return false;

      const parent = store.getNodeById(parentId);
      if (!parent) return false;

      if (includeGrandChildren) {
        return store.getChildren(parent.id, true).some((existingChild) => existingChild.id === unknownChildId);
      }

      return parent.children.some((existingChildId) => existingChildId === unknownChildId);
    },

    isChildOf(childId: string, potentialParentId: string): boolean {
      const store = get();
      const child = store.getNodeById(childId);
      if (!child) return false;

      const parent = store.getNodeById(potentialParentId);
      if (!parent) return false;

      return parent.children.some((existingChildId) => existingChildId === child.id);
    },

    getChildrenIds(parentId: string, includeGrandChildren?: boolean): string[] {
      const store = get();
      const parent = store.getNodeById(parentId);
      if (!parent || parent.children.length < 1) return [];

      if (includeGrandChildren) {
        return parent.children.reduce((acc: string[], id: string) => {
          acc.push(id);

          return acc.concat(store.getChildrenIds(id, true));
        }, []);
      }

      return parent.children;
    },

    getChildren(parentId: string, includeGrandChildren = false): Idea[] {
      const store = get();
      const parent = store.getNodeById(parentId);
      if (!parent || parent.children.length < 1) return [];

      const childrenIds = store.getChildrenIds(parentId, includeGrandChildren);
      const children = childrenIds.map((childId) => store.getNodeById(childId));
      const filtered = children.filter(Boolean) as Idea[];

      return filtered;
    },

    setHighlight(nodeId: string): void {
      set(() => ({ highlightId: nodeId }));
    },

    clearHighlight(): void {
      set(() => ({ highlightId: undefined }));
    },

    setSelection(newSelectionId: string): void {
      const store = get();
      if (store.selectionId !== undefined) {
        const selection = store.getSelectedNode();
        if (selection) {
          selection.setState(NODE_STATE.IDLE);
          store.updateSingleItem(selection);
        }
      }
      set(() => ({ selectionId: newSelectionId }));
      const newlySelected = store.getNodeById(newSelectionId);
      if (!newlySelected) {
        console.log('Could not find newly selected item');
        return;
      }
      newlySelected.setState(NODE_STATE.SELECTED);
      store.updateSingleItem(newlySelected);
    },

    clearSelection(): void {
      const store = get();
      if (store.selectionId === undefined) return;
      const selection = store.getSelectedNode();
      if (!selection) return;

      if (!selection.hasValue() && !selection.hasDefaultValue() && !selection.isRootNode) {
        store.removeNode(selection.id);

        return;
      }
      selection.setState(NODE_STATE.IDLE);
      store.updateSingleItem(selection);
      set(() => ({ selectionId: undefined }));
    },

    stopEditing(checkDefaultValue = false): void {
      const store = get();
      if (store.selectionId === undefined) return;
      const selection = store.getSelectedNode();
      if (!selection) return;

      const isEmpty = !selection.hasValue();
      const isntRootNode = selection.id !== store.rootNode.id;
      const hasDefaultValue = checkDefaultValue && !selection.hasDefaultValue();
      if ((isEmpty && isntRootNode) || hasDefaultValue) {
        store.removeNode(selection.id);

        return;
      }

      selection.setState(NODE_STATE.SELECTED);
      store.updateSingleItem(selection);
      store.resolveOverlaps(selection);
      selection.refreshPosition();

      setTimeout(() => {
        store.saveCurrentMindMapAsJSON();
      }, 200);
    },

    setIsGroupDragOn(isOn: boolean): void {
      set(() => ({ isGroupDragOn: isOn }));
    },

    /* Remove node and return true if was removed and false if it wasn't. */
    removeIfEmpty(node: Idea): boolean {
      const store = get();

      if (!node.hasValue() && !node.hasDefaultValue()) {
        store.removeNode(node.id);

        return true;
      }

      return false;
    },

    getHighlightedNode(): Idea | undefined {
      const store = get();
      return store.highlightId ? store.getNodeById(store.highlightId) : undefined;
    },

    getSelectedNode(): Idea | undefined {
      const store = get();
      return store.selectionId ? store.getNodeById(store.selectionId) : undefined;
    },

    editSelection(): void {
      const store = get();
      const selection = store.getSelectedNode();
      if (!selection) return;

      selection.setState(NODE_STATE.EDITED);
      selection.refreshPosition();
      store.updateSingleItem(selection);
    },

    updateSingleItem(item: Idea): void {
      set((state) => ({ nodes: [item, ...state.nodes.filter((i) => i.id !== item.id)] }));
    },

    updateSelectionContent(value: string): void {
      const store = get();
      const selection = store.getSelectedNode();
      if (!selection) return;

      selection.updateContent(value);

      store.updateSingleItem(selection);
    },

    isOverlappingWith(node: Idea, other: Idea): OverlapResult {
      const { width, height, x, y } = node.getBoundingBox();
      const { x: a, y: b, width: otherWidth, height: otherHeight } = other.getBoundingBox();
      const isColliding = x + width >= a && y + height >= b && y <= b + otherHeight && x <= a + otherWidth;
      const result = {
        amount: new Vector(),
        isColliding,
        other,
      };
      if (isColliding) {
        result.amount = {
          x: -x + a + width,
          y: -y + b + height,
        };
      }

      return result;
    },

    findOverlapsFor(node: Idea): OverlapResult[] {
      const store = get();
      const overlaps: OverlapResult[] = [];
      store.nodes.forEach((otherNode: Idea) => {
        if (otherNode.id !== node.id) {
          const result = store.isOverlappingWith(node, otherNode);

          if (result.isColliding) {
            overlaps.push(result);
          }
        }
      });

      return overlaps;
    },

    resolveOverlaps(node: Idea, axis = 'y'): Idea {
      const store = get();
      const overlaps: OverlapResult[] = store.findOverlapsFor(node);
      if (overlaps.length < 1) return node;

      const { amount } = overlaps[0];
      if (amount.x > 0 || amount.y > 0) {
        const targetPosition: Vector = node.getPosition();
        const offset = amount[axis] + Math.sign(amount[axis]) * store.defaultSpawnGap[axis];
        if (node.prevIsParentOnLeft) {
          targetPosition[axis] += offset;
        } else {
          targetPosition[axis] -= offset;
        }
        node.setPosition(targetPosition);
        count++;
        if (count < maxSteps) store.resolveOverlaps(node, 'y');
        else count = 0;
      }

      return node;
    },

    findClosestOverlapFor(node: Idea): void {
      const store = get();
      const myPosition = node.getPosition();
      const overlaps: OverlapResult[] = store.findOverlapsFor(node);
      let closestIndex = 0;
      let closestDistance = 0;

      if (overlaps.length > 0) {
        overlaps.forEach((overlap: OverlapResult, index: number) => {
          const distance = getTwoPointsDistance(myPosition, overlap.other.getPosition());
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        node.setClosestOverlap(overlaps[closestIndex].other.id);

        return;
      }

      node.clearClosestOverlap();
    },

    isParentOnLeft(nodeId: string): boolean {
      const store = get();
      const node = store.getNodeById(nodeId);
      if (!node) return false;

      const parent = store.getNodeById(node.parentId ?? '');
      if (!parent) return false;

      return parent.x < node.x;
    },

    getConnectorPoints(nodeId: string): ObjectOfVectors {
      const store = get();
      const node = store.getNodeById(nodeId);
      if (!node) return {};

      const parent = store.getNodeById(node.parentId ?? '');
      if (!parent) return {};

      const isParentsOnLeft = parent ? parent.x < node.x : false;
      const grandParent = store.getNodeById(parent.parentId ?? '');
      const isParentsOutOnLeft = parent && grandParent ? grandParent.x < parent.x : isParentsOnLeft;

      const myCorners = node.getCorners();
      const parentCorners = parent.getCorners() ?? myCorners;

      return {
        me: isParentsOnLeft ? myCorners.bottom.left : myCorners.bottom.right,
        parent: isParentsOutOnLeft ? parentCorners.bottom.right : parentCorners.bottom.left,
      };
    },

    setPositionAsync(nodeId: string, newPosition: Vector, callback?: () => void): void {
      const store = get();
      const node = store.getNodeById(nodeId);
      if (!node) return;

      setTimeout(() => {
        if (node.getElement()) {
          node.setPosition(newPosition);
          if (node.parentId !== undefined) node.prevIsParentOnLeft = store.isParentOnLeft(node.id);
          if (callback) {
            callback();
          }
          return;
        }

        setTimeout(() => store.setPositionAsync(node.id, newPosition), 20);
      }, 0);
    },

    initPositions(): void {
      get().nodes.forEach((t: Idea) => {
        if (t.isRootNode && t.x === 0 && t.y === 0) {
          t.setPosition(view.getMapCenterCoordinates());
        }
        t.refreshPosition();
      });
    },

    updateWorkspaceSize(): void {
      const { x, y } = getWindowInnerSize();
      const { canvas } = view;
      if (!canvas) throw new Error('Canas not avilable.');

      canvas.setAttribute('width', `${x}`);
      canvas.setAttribute('height', `${y}`);
      view.setMiniMapViewportProportionalSize();
    },

    getCurrentMindMapState(): SavedStateType {
      const store = get();

      return {
        nodes: store.nodes.map((t: Idea): SavedNodeStateType => {
          const { content, id, isRootNode, prevIsParentOnLeft, x, y, parentId, children } = t;

          return {
            content,
            id,
            isRootNode,
            prevIsParentOnLeft,
            x,
            y,
            parentId,
            children,
          };
        }),
      };
    },

    saveCurrentMindMapAsJSON(): void {
      const store = get();

      if (store.saveDebounceId) clearTimeout(store.saveDebounceId);

      set(() => ({
        saveDebounceId: setTimeout(() => {
          const data = JSON.stringify(store.getCurrentMindMapState());
          set(() => ({ savedMindMap: `text/json;charset=utf-8,${encodeURIComponent(data)}` }));
        }, 500),
      }));
    },

    deserializeMindMap(saved: SavedStateType): void {
      const store = get();

      store.clearHighlight();
      store.clearSelection();
      set(() => ({ nodes: [] }));

      // recreate saved nodes
      const uploadedNodes: Idea[] = saved.nodes.map((t: SavedNodeStateType): Idea => {
        const { id, x, y, isRootNode, content, parentId } = t;
        const restored: Idea = store.addNode({ x, y }, isRootNode, parentId, content, id);
        restored.children = t.children;
        store.saveChildrenRelativePosition(restored.id);
        return restored;
      });

      const postSetup = () => {
        set(() => ({ nodes: uploadedNodes }));
        set(() => ({ isDrawingLocked: false }));
        store.setSelection(store.rootNode.id);
        store.editSelection();
        store.initPositions();
        view.centerOnNode(store.rootNode);
      };
      setTimeout(postSetup, 0);
    },

    setDrawLock(isDrawingLocked: boolean): void {
      set(() => ({ isDrawingLocked }));
    },

    customOnFinishHydration(): void {
      const store = get();
      const hydratedNodes = store.nodes.map((node) => Idea.clone(node));
      const root = hydratedNodes.find(({ isRootNode }) => !!isRootNode);

      set(() => ({
        nodes: hydratedNodes,
        rootNode: root,
      }));
    },
  };
};
