import { v4 as uuidv4 } from 'uuid';
import { Idea, defaultTextTemplate } from '../../../services/models/idea';
import { Vector } from '../base-types';

const defaultRoot = new Idea(uuidv4(), new Vector(), undefined, true, defaultTextTemplate);

export const editorDefaultState = {
  connectorsCurveDividerWidth: 2.2,
  defaultSpawnGap: { x: 5, y: 5 },
  isDrawingLocked: false,
  isGroupDragOn: true,
  isInitialized: false,
  initialNodeWidth: 140,
  maxNodeWidth: 220,
  rootNode: defaultRoot,
  nodes: [defaultRoot],
  savedMindMap: '',
  scale: 1,
  selectionId: undefined,
  saveDebounceId: undefined,
};
