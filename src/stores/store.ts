import create from 'zustand';
import shallow from 'zustand/shallow';
import { Pointer } from '../classes/Pointer';
import { Thought } from '../classes/Thought';
import { ViewController } from '../classes/ViewController';
import { theme } from '../styles/themeDefault';
import {
  ChildPositionData,
  Miniature,
  SavedStateType,
  SavedThoughtStateType,
  THOUGHT_STATE,
  Vector,
} from '../types/baseTypes';
import { get, getTwoPointsDistance, getWindowInnerSize } from '../utils/get';

export type OverlapResult = {
  other: Thought;
  amount: Vector;
  isColliding: boolean;
};

export type TAxis = 'x' | 'y';

export type TStore = {
  connectorsCurveDividerWidth: number;
  defaultSpawnGap: Vector;
  highlight?: Thought;
  isDrawingLocked: boolean;
  isGroupDragOn: boolean;
  isInitialized: boolean;
  initialThoughtWidth: number;
  pointer: Pointer;
  rootThought: Thought;
  savedMindMap: string;
  scale: number;
  selection?: Thought;
  thoughts: Thought[];
  view?: ViewController;
  lastNewId: number;
  initialize(): void;
  addThought(position: Vector, isRoot?: boolean, parent?: Thought, initText?: string, id?: number): Thought;
  getNewID(): number;
  postNewThoughActions(newSibling: Thought): void;
  createChildThought(thought: Thought): void;
  createSiblingThought(thought: Thought): void;
  setHighlight(thought: Thought): void;
  clearHighlight(): void;
  setSelection(thought: Thought): void;
  clearSelection(): void;
  stopEditing(): void;
  setIsGroupDragOn(isOn: boolean): void;
  removeThought(thought: Thought): void;
  removeIfEmpty(thought: Thought): void;
  editSelection(): void;
  updateSelectionContent(value: string): void;
  isOverlappingWith(thought: Thought, other: Thought): OverlapResult;
  findOverlapsFor(thought: Thought): OverlapResult[];
  resolveOverlaps(thought: Thought, axis?: TAxis): Thought;
  findClosestOverlapFor(thought: Thought): void;
  updateWorkspaceSize(): void;
  saveCurrentMindMapAsJSON(): void;
  getCurrentMindMapState(): SavedStateType;
  loadUploadedMindMap(saved: SavedStateType): void;
  setDrawLock(isDrawingLocked: boolean): void;
  draw(): void;
  updateSingleItem(item: Thought): void;
  onMouseMove(event: MouseEvent): void;
};

const defaultRoot = new Thought(0, { x: 0, y: 0 }, undefined, true, "What's on your mind?");

export const initializeSelector = (store: TStore): (() => void) => store.initialize;
export const thoughtsSelector = (store: TStore): Thought[] => store.thoughts;
export const pointerSelector = (store: TStore): Pointer => store.pointer;
export const viewSelector = (store: TStore): ViewController | undefined => store.view;
export const selectionSelector = (store: TStore): Thought | undefined => store.selection;
export const editSelectionSelector = (store: TStore): (() => void) => store.editSelection;
export const updateSelectionContentSelector = (store: TStore): ((value: string) => void) =>
  store.updateSelectionContent;
export const findClosestOverlapForSelector = (store: TStore): ((thought: Thought) => void) =>
  store.findClosestOverlapFor;
export const isGroupDragOnSelector = (store: TStore): boolean => store.isGroupDragOn;
export const setHighlightSelector = (store: TStore): ((thought: Thought) => void) => store.setHighlight;
export const clearHighlightSelector = (store: TStore): (() => void) => store.clearHighlight;
export const initialThoughtWidthSelector = (store: TStore): number => store.initialThoughtWidth;
export const savedMindMapSelector = (store: TStore): string => store.savedMindMap;
export const setDrawLockSelector = (store: TStore): ((isDrawingLocked: boolean) => void) => store.setDrawLock;
export const loadUploadedMindMapSelector = (store: TStore): ((saved: SavedStateType) => void) =>
  store.loadUploadedMindMap;

export const onMouseMoveSelector = (store: TStore): ((event: MouseEvent) => void) => store.onMouseMove;

export const useMindMapStore = create<TStore>((set, getStore) => ({
  connectorsCurveDividerWidth: 2.2,
  defaultSpawnGap: { x: 25, y: 10 },
  isDrawingLocked: false,
  isGroupDragOn: false,
  isInitialized: false,
  initialThoughtWidth: 200,
  pointer: new Pointer(),
  savedMindMap: '',
  scale: 1,
  selection: undefined,
  rootThought: defaultRoot,
  view: undefined,
  thoughts: [defaultRoot],
  lastNewId: 0,

  initialize(): void {
    const store = getStore();
    if (store.isInitialized) return;

    const canvas = get<HTMLCanvasElement>('canvas');
    if (!canvas) throw new Error('Could not find canvas.');

    const view = new ViewController(canvas);
    set(() => ({ view }));

    store.updateWorkspaceSize();
    window.addEventListener('resize', store.updateWorkspaceSize);
    view.setThoughtsContainerPosition();
    view.centerMindMap();
    store.rootThought.setPositionAsync(view.getMapCenterCoordinates());
    store.editSelection();

    const drawLoop = (): void => {
      store.draw();
      requestAnimationFrame(drawLoop);
    };

    drawLoop();

    set(() => ({ isInitialized: true }));
    set(() => ({ selection: store.rootThought }));
  },

  getNewID(): number {
    const store = getStore();
    const id = store.lastNewId + 1;
    store.lastNewId = id;

    return id;
  },

  addThought(position: Vector, isRoot?: boolean, parent?: Thought, initText?: string): Thought {
    const store = getStore();

    const thought = new Thought(store.getNewID(), position, parent, isRoot, initText);
    store.updateSingleItem(thought);
    if (isRoot) {
      store.rootThought = thought;
    }

    return thought;
  },

  postNewThoughActions(newItem: Thought): void {
    const store = getStore();

    if (!newItem.isFullyWithinViewport()) {
      const offset = newItem.getViewportOffset();
      store.view?.setMapPosition(-offset.x + Math.sign(-offset.x) * 20, -offset.y + Math.sign(-offset.y) * 20);
    }
    store.editSelection();
    store.saveCurrentMindMapAsJSON();
    window.console.log(newItem);
  },

  createChildThought(parent: Thought): void {
    const store = getStore();

    store.stopEditing();
    const targetPosition: Vector = parent.getPosition();
    const sideMod = parent.hasParent() && !parent.isParentOnLeft() ? -1 : 1;
    targetPosition.x +=
      (parent.getOuterWidth() * 0.5 + store.initialThoughtWidth * 0.5 + store.defaultSpawnGap.x) * sideMod;
    const newChild: Thought = store.addThought(targetPosition, false, parent);
    parent.children.push(newChild);
    store.setSelection(newChild);
    store.resolveOverlaps(newChild);
    newChild.refreshPosition();
    parent.saveChildrenRelativePosition();
    setTimeout(() => {
      store.postNewThoughActions(newChild);
    }, 100);
  },

  createSiblingThought(sibling: Thought): void {
    const store = getStore();

    store.stopEditing();
    if (!store.selection) return;
    const targetPosition: Vector = sibling.getPosition();
    targetPosition.y += sibling.getOuterHeight() * 0.5 + 30 + store.defaultSpawnGap.y;
    const newSibling: Thought = store.addThought(targetPosition, false, sibling.parent);
    if (sibling.parent) sibling.parent.addChildThought(newSibling);
    if (store.selection) store.removeIfEmpty(store.selection);
    store.setSelection(newSibling);
    store.resolveOverlaps(newSibling);
    newSibling.refreshPosition();
    if (sibling.parent) sibling.parent.saveChildrenRelativePosition();
    setTimeout(() => {
      store.postNewThoughActions(newSibling);
    }, 100);
  },

  setHighlight(thought: Thought): void {
    set(() => ({ highlight: thought }));
  },

  clearHighlight(): void {
    set(() => ({ highlight: undefined }));
  },

  setSelection(item: Thought): void {
    const store = getStore();
    if (store.selection) {
      store.selection.setState(THOUGHT_STATE.IDLE);
      store.updateSingleItem(store.selection);
      // window.console.log('lol');
    }
    set(() => ({ selection: item }));
    item.setState(THOUGHT_STATE.SELECTED);
    store.updateSingleItem(item);
  },

  clearSelection(): void {
    const store = getStore();
    if (!store.selection) return;

    if (!store.selection.hasValue() && !store.selection.isRootThought) {
      store.removeThought(store.selection);

      return;
    }
    store.selection.setState(THOUGHT_STATE.IDLE);
    store.updateSingleItem(store.selection);
    set(() => ({ selection: undefined }));
  },

  stopEditing(): void {
    const store = getStore();
    if (!store.selection) return;

    if (!store.selection.hasValue() && store.selection.id !== store.rootThought.id) {
      store.removeThought(store.selection);

      return;
    }
    store.selection.setState(THOUGHT_STATE.SELECTED);
    store.updateSingleItem(store.selection);
    store.resolveOverlaps(store.selection);
    store.selection.refreshPosition();
    setTimeout(() => {
      store.saveCurrentMindMapAsJSON();
    }, 200);
  },

  setIsGroupDragOn(isOn: boolean): void {
    set(() => ({ isGroupDragOn: isOn }));
  },

  removeThought(thought: Thought): void {
    const store = getStore();
    thought.markForRemoval();

    if (store.highlight && store.highlight.id === thought.id) {
      set(() => ({ highlight: undefined }));
    }
    if (store.selection && store.selection.id === thought.id) {
      set(() => ({ selection: undefined }));
    }
    thought.children.forEach((child) => {
      store.removeThought(child);
    });
    set(() => ({
      thoughts: store.thoughts.filter((item: Thought) => item.id !== thought.id),
    }));
    if (thought.hasParent()) {
      thought.parent?.removeChildThought(thought);
    }
    setTimeout(() => {
      store.saveCurrentMindMapAsJSON();
    }, 200);
  },

  removeIfEmpty(thought: Thought): void {
    const store = getStore();

    if (!thought.hasValue()) {
      store.removeThought(thought);
    }
  },

  editSelection(): void {
    const store = getStore();
    const { selection } = store;
    if (!selection) return;

    selection.setState(THOUGHT_STATE.EDITED);
    selection.refreshPosition();
    store.updateSingleItem(selection);
  },

  updateSingleItem(item: Thought): void {
    set((state) => ({ thoughts: [item, ...state.thoughts.filter((i) => i.id !== item.id)] }));
  },

  updateSelectionContent(value: string): void {
    const store = getStore();
    const { selection } = store;
    if (!selection) return;

    selection.updateContent(value);

    store.updateSingleItem(selection);
  },

  isOverlappingWith(thought: Thought, other: Thought): OverlapResult {
    const { width, height, x, y } = thought.getBoundingBox();
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

  findOverlapsFor(thought: Thought): OverlapResult[] {
    const store = getStore();
    const overlaps: OverlapResult[] = [];
    store.thoughts.forEach((otherThought: Thought) => {
      if (otherThought.id !== thought.id) {
        const result = store.isOverlappingWith(thought, otherThought);

        if (result.isColliding) {
          overlaps.push(result);
        }
      }
    });

    return overlaps;
  },

  resolveOverlaps(thought: Thought, axis = 'y'): Thought {
    const store = getStore();
    const overlaps: OverlapResult[] = store.findOverlapsFor(thought);
    if (overlaps.length < 1) return thought;

    const { amount } = overlaps[0];
    if (amount.x > 0 || amount.y > 0) {
      const targetPosition: Vector = thought.getPosition();
      if (axis === 'y') {
        targetPosition.x += amount[axis] + Math.sign(amount[axis]) * store.defaultSpawnGap[axis];
      } else if (axis === 'x') {
        targetPosition.y += amount[axis] + Math.sign(amount[axis]) * store.defaultSpawnGap[axis];
      }
      thought.setPosition(targetPosition);
      store.resolveOverlaps(thought, 'y');
    }

    return thought;
  },

  findClosestOverlapFor(thought: Thought): void {
    const store = getStore();
    const myPosition = thought.getPosition();
    const overlaps: OverlapResult[] = store.findOverlapsFor(thought);
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
      thought.setClosestOverlap(overlaps[closestIndex].other);

      return;
    }

    thought.clearClosestOverlap();
  },

  updateWorkspaceSize(): void {
    const store = getStore();
    if (!store.view) return;

    const { x, y } = getWindowInnerSize();
    const { canvas } = store.view;
    canvas.setAttribute('width', `${x}`);
    canvas.setAttribute('height', `${y}`);
    store.view.setMiniMapViewportProportionalSize();
  },

  getCurrentMindMapState(): SavedStateType {
    const store = getStore();

    return {
      thoughts: store.thoughts.map((t: Thought): SavedThoughtStateType => {
        const { content, id, isRootThought, prevIsParentOnLeft, x, y } = t;

        return {
          children: t.children.map((child) => child.id),
          content,
          id,
          isRootThought,
          parent: t.parent ? t.parent.id : undefined,
          prevIsParentOnLeft,
          x,
          y,
        };
      }),
    };
  },

  saveCurrentMindMapAsJSON(): void {
    const store = getStore();

    const data = JSON.stringify(store.getCurrentMindMapState());
    set(() => ({ savedMindMap: `text/json;charset=utf-8,${encodeURIComponent(data)}` }));
  },

  loadUploadedMindMap(saved: SavedStateType): void {
    const store = getStore();

    store.clearHighlight();
    store.clearSelection();
    set(() => ({ thoughts: [] }));

    const uploadedThoughts: Thought[] = saved.thoughts.map((t: SavedThoughtStateType): Thought => {
      const { id, x, y, isRootThought, content } = t;
      const restored: Thought = store.addThought({ x, y }, isRootThought, undefined, content, id);

      return restored;
    });

    const thoughts = uploadedThoughts.map((thought: Thought): Thought => {
      const t = thought;
      const savedThought = saved.thoughts.find((savedT) => savedT.id === t.id);

      if (!savedThought) return t;

      const parentId = savedThought.parent;
      if (parentId !== undefined) {
        const parent = uploadedThoughts.find((potentialParent) => potentialParent.id === parentId);
        if (parent) {
          t.setParent(parent);
        }
      }
      if (savedThought.children.length > 0) {
        savedThought.children.forEach((childId: number): void => {
          const child = uploadedThoughts.find((potentialChild) => potentialChild.id === childId);
          if (child) {
            t.addChildThought(child);
          }
        });
      }
      t.saveChildrenRelativePosition();
      t.prevIsParentOnLeft = savedThought.prevIsParentOnLeft;
      t.state = 0;

      return t;
    });

    set(() => ({ thoughts }));

    store.thoughts.forEach((t: Thought) => {
      t.refreshPosition();
      if (t.isRootThought) {
        const root = store.rootThought;

        root.updateContent(t.content);
        root.id = t.id;
        root.setPositionAsync({ x: t.x, y: t.y }, () => {
          set(() => ({ isDrawingLocked: false }));
          store.saveCurrentMindMapAsJSON();
        });
      }
    });
  },

  setDrawLock(isDrawingLocked: boolean): void {
    set(() => ({ isDrawingLocked }));
  },

  draw(): void {
    const store = getStore();
    if (!store.view?.context || !store.view || !store.view.canvas || store.isDrawingLocked) return;
    const { connectorsCurveDividerWidth, rootThought, thoughts, view } = store;

    // view.context.translate(0.5, 0.5);
    view.context?.clearRect(0, 0, view.canvas.width, view.canvas.height);

    if (thoughts.length > 0) {
      const miniatures: Miniature[] = [];
      thoughts.forEach((thought) => {
        const miniature = view.getMiniMapMiniature(thought.getPosition(), thought.getSize(), thought.id);
        miniatures.push(miniature);
        view.drawMiniature(miniature);
      });

      if (rootThought) {
        const rootsChildren: Thought[] = rootThought.getChildren(true);
        const offset: Vector = view.getThoughtsContainerPosition();
        if (rootsChildren.length < 1) return;

        rootsChildren.forEach((child: Thought) => {
          const { me, parent } = child.getConnectorPoints();
          me.x += offset.x;
          me.y += offset.y - 1;
          parent.x += offset.x;
          parent.y += offset.y - 1;
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
          const parentMiniature = miniatures.filter((mini) => mini.id === child.parent?.id)[0];
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
      }
    }
    // view.context.translate(-0.5, -0.5);
  },

  onMouseMove(event: MouseEvent): void {
    const store = getStore();
    const { pointer, view, selection } = store;

    pointer.lastPosition.x = pointer.position.x;
    pointer.lastPosition.y = pointer.position.y;
    pointer.position.x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    pointer.position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

    if (pointer.isLeftButtonDown && view && selection && selection.id.toString() === pointer.draggedItemId) {
      const { x, y } = pointer.position;
      store.findClosestOverlapFor(selection);
      selection.setState(THOUGHT_STATE.DRAGGED);
      selection.setOnTop();
      selection.setPosition({
        x: x + selection.diffX,
        y: y + selection.diffY,
      });
      if (store.isGroupDragOn && selection.hasChildren()) {
        const isParentOnLeft = selection.isParentOnLeft();
        if (!selection.isRootThought && isParentOnLeft !== selection.prevIsParentOnLeft) {
          selection.childrenRelativePosition.forEach((_: ChildPositionData, index: number): void => {
            const positionData = selection.childrenRelativePosition[index];
            positionData.position.x *= -1; // eslint-disable-line no-param-reassign
          });
        }
        selection.restoreChildrenRelativePosition();
        selection.setPrevIsParentOnLeft(isParentOnLeft);
      }
    }
  },
}));

export const useSelection = (): [Thought | undefined, (thought: Thought) => void, () => void] =>
  useMindMapStore((state) => [state.selection, state.setSelection, state.editSelection], shallow);
