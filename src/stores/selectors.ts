import { SavedStateType } from '../types/baseTypes';
import { Pointer } from './pointer';
import { Thought } from './Thought';
import { TStore } from './types';

export const initializeSelector = (store: TStore): (() => void) => store.initialize.bind(store);
export const thoughtsSelector = (store: TStore): Thought[] => store.thoughts;
export const pointerSelector = (store: TStore): Pointer => store.pointer;
export const selectionSelector = (store: TStore): Thought | undefined => store.getSelectedThought();
export const editSelectionSelector = (store: TStore): (() => void) => store.editSelection.bind(store);
export const updateSelectionContentSelector = (store: TStore): ((value: string) => void) =>
  store.updateSelectionContent.bind(store);
export const findClosestOverlapForSelector = (store: TStore): ((thought: Thought) => void) =>
  store.findClosestOverlapFor.bind(store);
export const isGroupDragOnSelector = (store: TStore): boolean => store.isGroupDragOn;
export const setHighlightSelector = (store: TStore): ((thoughtId: string) => void) => store.setHighlight.bind(store);
export const clearHighlightSelector = (store: TStore): (() => void) => store.clearHighlight.bind(store);
export const initialThoughtWidthSelector = (store: TStore): number => store.initialThoughtWidth;
export const savedMindMapSelector = (store: TStore): string => store.savedMindMap;
export const setDrawLockSelector = (store: TStore): ((isDrawingLocked: boolean) => void) =>
  store.setDrawLock.bind(store);
export const deserializeMindMapSelector = (store: TStore): ((saved: SavedStateType) => void) =>
  store.deserializeMindMap.bind(store);
export const onMouseMoveSelector = (store: TStore): ((event: MouseEvent) => void) => store.onMouseMove.bind(store);
