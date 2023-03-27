export type Vector = {
  x: number;
  y: number;
};

export interface ObjectOfNumbers {
  [key: string]: number;
}

export interface ObjectOfStrings {
  [key: string]: string;
}

export interface ObjectOfVectors {
  [key: string]: Vector;
}

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
  parentId: string | undefined;
  prevIsParentOnLeft: boolean;
  x: number;
  y: number;
};

export type SavedStateType = {
  nodes: SavedNodeStateType[];
};
