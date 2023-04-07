import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { theme } from '../styles/themeDefault';
import {
  ChildPositionData,
  Miniature,
  NODE_STATE,
  ObjectOfVectors,
  SavedNodeStateType,
  SavedStateType,
  Vector,
} from '../types/baseTypes';
import { getTwoPointsDistance, getWindowInnerSize } from '../utils/get';
import { defaultTextTemplate, Node } from './Node';
import { pointer } from './pointer';
import { OverlapResult, TStore } from './types';
import { view } from './view';

const defaultRoot = new Node(uuidv4(), { x: 0, y: 0 }, undefined, true, defaultTextTemplate);
const maxSteps = 100;
let count = 0;

export const useMindMapStore = create(
  persist<TStore>(
    (set, get) => ({
      pointer,
      connectorsCurveDividerWidth: 2.2,
      defaultSpawnGap: { x: 25, y: 5 },
      isDrawingLocked: false,
      isGroupDragOn: true,
      isInitialized: false,
      initialNodeWidth: 200,
      rootNode: defaultRoot,
      nodes: [defaultRoot],
      savedMindMap: '',
      scale: 1,
      lastNewId: 0,
      selection: undefined,
      saveDebounceId: undefined,

      initialize(): void {
        const store = get();

        window.addEventListener('resize', store.updateWorkspaceSize.bind(store));

        view.setReferences();
        store.updateWorkspaceSize();
        view.setNodesContainerPosition();
        const root = store.rootNode;
        store.setSelection(root.id);
        store.editSelection();
        store.initPositions();
        view.centerOnNode(store.rootNode);

        const drawLoop = (): void => {
          store.draw();
          requestAnimationFrame(drawLoop);
        };

        drawLoop();
      },

      getNewID(): string {
        return uuidv4();
      },

      addNode(position: Vector, isRoot?: boolean, parentId?: string, initText?: string, existingId?: string): Node {
        const store = get();

        const node = new Node(existingId ?? store.getNewID(), position, parentId, isRoot, initText);
        store.updateSingleItem(node);
        if (isRoot) {
          set(() => ({ rootNode: node }));
        }

        store.setPositionAsync(node.id, position);

        return node;
      },

      postNewThoughActions(newItem: Node): void {
        const store = get();

        const isFullyWithinViewport = !newItem.isFullyWithinViewport();
        if (!isFullyWithinViewport) {
          const offset = newItem.getViewportOffset();
          view.setMapPosition(-offset.x + Math.sign(-offset.x) * 20, -offset.y + Math.sign(-offset.y) * 20);
        }
        store.editSelection();
        store.saveCurrentMindMapAsJSON();
      },

      getNodeById(id: string): Node | undefined {
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
        node.childrenRelativePosition = store.getChildren(node.id, true).map((child: Node): ChildPositionData => {
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

      createChildNode(parent: Node): void {
        const store = get();
        store.stopEditing();

        if (store.selectionId === undefined) return;

        const targetPosition: Vector = parent.getPosition();
        const sideMod = parent.hasParent() && !store.isParentOnLeft(parent.id) ? -1 : 1;
        targetPosition.x +=
          (parent.getOuterWidth() * 0.5 + store.initialNodeWidth * 0.5 + store.defaultSpawnGap.x) * sideMod;

        const newChild: Node = store.addNode(targetPosition, false, parent.id);
        parent.children.push(newChild.id);

        store.setSelection(newChild.id);
        store.resolveOverlaps(newChild);
        newChild.refreshPosition();
        store.saveChildrenRelativePosition(parent.id);

        setTimeout(() => {
          store.postNewThoughActions(newChild);
        }, 100);
      },

      createSiblingNode(sibling: Node): void {
        const store = get();
        store.stopEditing();

        if (store.selectionId === undefined) return;

        const targetPosition: Vector = sibling.getPosition();
        targetPosition.y += sibling.getOuterHeight() * 0.5 + 30 + store.defaultSpawnGap.y;
        const newSibling: Node = store.addNode(targetPosition, false, sibling.parentId);

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
          nodes: [...state.nodes.filter((item: Node) => item.id !== nodeId)],
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

      getChildren(parentId: string, includeGrandChildren = false): Node[] {
        const store = get();
        const parent = store.getNodeById(parentId);
        if (!parent || parent.children.length < 1) return [];

        const childrenIds = store.getChildrenIds(parentId, includeGrandChildren);
        const children = childrenIds.map((childId) => store.getNodeById(childId));
        const filtered = children.filter(Boolean) as Node[];

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
      removeIfEmpty(node: Node): boolean {
        const store = get();

        if (!node.hasValue() && !node.hasDefaultValue()) {
          store.removeNode(node.id);

          return true;
        }

        return false;
      },

      getHighlightedNode(): Node | undefined {
        const store = get();
        return store.highlightId ? store.getNodeById(store.highlightId) : undefined;
      },

      getSelectedNode(): Node | undefined {
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

      updateSingleItem(item: Node): void {
        set((state) => ({ nodes: [item, ...state.nodes.filter((i) => i.id !== item.id)] }));
      },

      updateSelectionContent(value: string): void {
        const store = get();
        const selection = store.getSelectedNode();
        if (!selection) return;

        selection.updateContent(value);

        store.updateSingleItem(selection);
      },

      isOverlappingWith(node: Node, other: Node): OverlapResult {
        const { width, height, x, y } = node.getBoundingBox();
        const { x: a, y: b, width: otherWidth, height: otherHeight } = other.getBoundingBox();
        const isColliding = x + width >= a && y + height >= b && y <= b + otherHeight && x <= a + otherWidth;
        const result = {
          amount: { x: 0, y: 0 },
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

      findOverlapsFor(node: Node): OverlapResult[] {
        const store = get();
        const overlaps: OverlapResult[] = [];
        store.nodes.forEach((otherNode: Node) => {
          if (otherNode.id !== node.id) {
            const result = store.isOverlappingWith(node, otherNode);

            if (result.isColliding) {
              overlaps.push(result);
            }
          }
        });

        return overlaps;
      },

      resolveOverlaps(node: Node, axis = 'y'): Node {
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

      findClosestOverlapFor(node: Node): void {
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
        get().nodes.forEach((t: Node) => {
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
          nodes: store.nodes.map((t: Node): SavedNodeStateType => {
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
        const uploadedNodes: Node[] = saved.nodes.map((t: SavedNodeStateType): Node => {
          const { id, x, y, isRootNode, content, parentId } = t;
          const restored: Node = store.addNode({ x, y }, isRootNode, parentId, content, id);
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

      draw(): void {
        if (!view) {
          throw new Error('View object reference not avilable');
        }

        const store = get();
        if (store.isDrawingLocked) return;

        const { canvas, context } = view;
        if (!canvas) {
          throw new Error('canvas object reference not avilable');
        }
        if (!context) {
          throw new Error('context object reference not avilable');
        }

        const { connectorsCurveDividerWidth, rootNode, nodes } = store;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (nodes.length < 1 || rootNode === undefined) return;

        const miniatures: Miniature[] = [];
        nodes.forEach((node) => {
          const miniature = view.getMiniMapMiniature(node.getPosition(), node.getSize(), node.id);
          miniatures.push(miniature);
          view.drawMiniature(miniature);
        });

        const rootsChildren: Node[] = store.getChildren(rootNode.id, true);
        const offset: Vector = view.getNodesContainerPosition();
        if (rootsChildren.length < 1) return;

        rootsChildren.forEach((child: Node) => {
          const { me, parent } = store.getConnectorPoints(child.id);
          me.x += offset.x;
          me.y += offset.y;
          parent.x += offset.x;
          parent.y += offset.y;
          me.x += 1;
          parent.x -= 1;
          const { x } = me;
          const { x: a } = parent;
          const mod = (x - a) / connectorsCurveDividerWidth;
          const bezierControlPointA = { x: -mod, y: 0 };
          const bezierControlPointB = { x: mod, y: 0 };
          view.drawBezierCurve(
            me,
            parent,
            bezierControlPointA,
            bezierControlPointB,
            theme.connectorsWidth,
            theme.colors.connectors(),
          );

          // draw miniatures connectors
          const myMiniature = miniatures.filter((mini) => mini.id === child.id)[0];
          const parentMiniature = miniatures.filter((mini) => mini.id === (child.parentId ?? -1))[0];
          const xStart = myMiniature.x > parentMiniature.x ? myMiniature.x : myMiniature.x + myMiniature.width;
          const yStart = myMiniature.y + myMiniature.height * 0.5;
          const xEnd =
            myMiniature.x > parentMiniature.x ? parentMiniature.x + parentMiniature.width : parentMiniature.x;
          const yEnd = parentMiniature.y + parentMiniature.height * 0.5;
          const miniatureMod = (xStart - xEnd) / connectorsCurveDividerWidth;
          const miniatureControlPointA = { x: -miniatureMod, y: 0 };
          const miniatureControlPointB = { x: miniatureMod, y: 0 };

          view.drawBezierCurve(
            { x: xStart, y: yStart },
            { x: xEnd, y: yEnd },
            miniatureControlPointA,
            miniatureControlPointB,
            1,
            theme.colors.miniatureConnector(),
          );
        });
      },

      onMouseMove(event: MouseEvent): void {
        const store = get();
        const { pointer: mouse } = store;
        const selection = store.getSelectedNode();

        mouse.lastPosition.x = mouse.position.x;
        mouse.lastPosition.y = mouse.position.y;
        mouse.position.x =
          event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        mouse.position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

        const selectionCanBeDragged = mouse.isLeftButtonDown && selection && selection.id === mouse.draggedItemId;
        if (!selectionCanBeDragged) return;

        const { x, y } = mouse.position;
        store.findClosestOverlapFor(selection);
        selection.setState(NODE_STATE.DRAGGED);
        selection.setOnTop();
        selection.setPosition({
          x: x + selection.diffX,
          y: y + selection.diffY,
        });

        const canDragSelectionChildren = store.isGroupDragOn && selection.hasChildren();
        if (!canDragSelectionChildren) return;

        const isParentOnLeft = store.isParentOnLeft(selection.id);
        if (!selection.isRootNode && isParentOnLeft !== selection.prevIsParentOnLeft) {
          selection.childrenRelativePosition.forEach((_: ChildPositionData, index: number): void => {
            const positionData = selection.childrenRelativePosition[index];
            positionData.position.x *= -1; // eslint-disable-line no-param-reassign
          });
        }
        store.restoreChildrenRelativePosition(selection.id);
        selection.setPrevIsParentOnLeft(isParentOnLeft);
      },

      customOnFinishHydration(): void {
        const store = get();
        const hydratedNodes = store.nodes.map((node) => Node.clone(node));
        const root = hydratedNodes.find(({ isRootNode }) => !!isRootNode);

        set(() => ({
          nodes: hydratedNodes,
          rootNode: root,
        }));
      },
    }),
    {
      // local storage id, change to abandon current storage and use new local storage
      name: 'c913d614-da17-4383-809f-fa6d6314535491',
      merge: (persistedState: unknown, currentState: TStore): TStore => {
        const retrivedState = persistedState as TStore;
        const retrivedNodes = retrivedState.nodes.map((node) => Node.clone(node));

        return {
          ...retrivedState,
          ...currentState,
          nodes: retrivedNodes,
          rootNode: retrivedNodes.find(({ isRootNode }) => !!isRootNode),
        } as TStore;
      },
    },
  ),
);

export const useSelection = (): [Node | undefined, (id: string) => void, () => void] =>
  useMindMapStore(
    (state) => [state.getSelectedNode(), state.setSelection.bind(state), state.editSelection.bind(state)],
    shallow,
  );
