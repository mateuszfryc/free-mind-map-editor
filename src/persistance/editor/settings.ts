import { Vector } from './base-types';

export class Settings {
  defaultSpawnGap: Vector = new Vector(5, 5);
  initialNodeWidth = 140;
  maxNodeWidth = 220;
  isDrawingLocked = false;
  isGroupDragOn = true;
  scale = 1;

  // ! this should be somewhere in rendering pipeline settings
  connectorsCurveDividerWidth = 2.2;
}
