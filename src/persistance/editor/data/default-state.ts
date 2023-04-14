import { v4 as uuidv4 } from 'uuid';
import { Vector } from '../base-types';
import { Idea, defaultTextTemplate } from '../idea';

const defaultRoot = new Idea(uuidv4(), new Vector(), undefined, true, defaultTextTemplate);

export const editorDefaultState = {
  connectorsCurveDividerWidth: 2.2,
  defaultSpawnGap: { x: 5, y: 5 },
  isDrawingLocked: false,
  isGroupDragOn: true,
  isInitialized: false,
  initialNodeWidth: 200,
  maxNodeWidth: 200,
  rootNode: defaultRoot,
  nodes: [defaultRoot],
  savedMindMap: '',
  scale: 1,
  selectionId: undefined,
  highlightId: undefined,
  saveDebounceId: undefined,
};
