import { Axis, ObjectOfVectors, SavedStateType, Vector } from './base-types';
import { Idea } from './idea';
import { IPointer } from './pointer';

export type Get = () => TEditorStore;
export type Set = (
  partial: TEditorStore | Partial<TEditorStore> | ((state: TEditorStore) => TEditorStore | Partial<TEditorStore>),
  replace?: boolean | undefined,
) => void;

export type OverlapResult = {
  other: Idea;
  amount: Vector;
  isColliding: boolean;
};

export interface IEditorState {
  pointer: IPointer;
  defaultSpawnGap: Vector;
  nodes: Idea[];
  rootNode: Idea;
  connectorsCurveDividerWidth: number;
  highlightId?: string;
  selectionId?: string;
  savedMindMap: string;
  maxNodeWidth: number;
  initialNodeWidth: number;
  scale: number;
  isDrawingLocked: boolean;
  isGroupDragOn: boolean;
  isInitialized: boolean;
  saveDebounceId?: NodeJS.Timeout;
  drawLoopRafId?: number;
}

export type TEditorStore = IEditorState & {
  initialize(): Promise<void>;
  startDrawLoop(): void;
  cancelDrawLoop(): void;
  unlockInit(): void;
  addNode(position: Vector, isRoot?: boolean, parentId?: string, initText?: string, existingId?: string): Idea;
  getNodeById(id: string): Idea | undefined;
  getNewID(): string;
  getHighlightedNode(): Idea | undefined;
  getSelectedNode(): Idea | undefined;
  saveChildrenRelativePosition(id: string): void;
  restoreChildrenRelativePosition(id: string): void;
  getChildrenIds(parentId: string, includeGrandChildren?: boolean): string[];
  getChildren(parentId: string, includeGrandChildren?: boolean): Idea[];
  addChildNode(newParentId: string, childId: string): void;
  removeChildNode(parentId: string, childToBeRemovedId: string): void;
  isParentOf(parentId: string, unknownChildId: string, includeGrandChildren?: boolean): boolean;
  isChildOf(childId: string, potentialParentId: string): boolean;
  postNewThoughActions(newSibling: Idea): void;
  createChildNode(node: Idea): void;
  createSiblingNode(node: Idea): void;
  setHighlight(nodeId: string): void;
  clearHighlight(): void;
  setSelection(newSelectionId: string): void;
  clearSelection(): void;
  stopEditing(checkDefaultValue?: boolean): void;
  setIsGroupDragOn(isOn: boolean): void;
  removeNode(nodeId: string): void;
  removeIfEmpty(node: Idea): void;
  editSelection(): void;
  isParentOnLeft(nodeId: string): boolean;
  getConnectorPoints(nodeId: string): ObjectOfVectors;
  updateSelectionContent(value: string): void;
  isOverlappingWith(node: Idea, other: Idea): OverlapResult;
  findOverlapsFor(node: Idea): OverlapResult[];
  resolveOverlaps(node: Idea, axis?: Axis): Idea;
  findClosestOverlapFor(node: Idea): void;
  setPositionAsync(nodeId: string, newPosition: Vector, callback?: () => void): void;
  initPositions(): void;
  updateWorkspaceSize(): void;
  saveCurrentMindMapAsJSON(): void;
  getCurrentMindMapState(): SavedStateType;
  deserializeMindMap(saved: SavedStateType): void;
  setDrawLock(isDrawingLocked: boolean): void;
  updateSingleItem(item: Idea): void;
  customOnFinishHydration(): void;
};
