import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Idea } from '../../services/models/idea';
import { createSelectors } from '../utils';
import { createEditorState } from './create-editor-state';
import { TEditorStore } from './editor-type';

const localStorageOptions = {
  // local storage id, change to abandon current storage and use new local storage
  name: 'c913d614-da17-4383-809f-fa6d63145d5491',
  merge: (persistedState: unknown, currentState: TEditorStore): TEditorStore => {
    const retrivedState = persistedState as TEditorStore;
    const retrivedNodes = retrivedState.nodes.map((node) => Idea.clone(node));

    return {
      ...retrivedState,
      ...currentState,
      nodes: retrivedNodes,
      rootNode: retrivedNodes.find(({ isRootNode }) => !!isRootNode),
    } as TEditorStore;
  },
};

const useEditorStoreBase = create<TEditorStore>()(persist<TEditorStore>(createEditorState, localStorageOptions));

export const useEditorStore = createSelectors(useEditorStoreBase);
export const editorStore = useEditorStore.use;
