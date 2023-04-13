export class Vector {
  constructor(public x = 0, public y = 0) {}
}

export type Axis = 'x' | 'y';

export type ObjectOf<T> = {
  [key: string]: T;
};

export type ObjectOfNumbers = ObjectOf<number>;
export type ObjectOfStrings = ObjectOf<string>;
export type ObjectOfVectors = ObjectOf<Vector>;

export type Miniature = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
};

export const NODE_STATE: ObjectOfNumbers = {
  IDLE: 0,
  SELECTED: 1,
  EDITED: 2,
  DRAGGED: 3,
};

export type ChildPositionData = {
  position: Vector;
  id: string;
};

export type IconProps = {
  color?: string;
};

export type SavedNodeStateType = {
  children: string[];
  content: string;
  id: string;
  isRootNode: boolean;
  parentId?: string;
  prevIsParentOnLeft: boolean;
  x: number;
  y: number;
};

export type SavedStateType = {
  nodes: SavedNodeStateType[];
};
