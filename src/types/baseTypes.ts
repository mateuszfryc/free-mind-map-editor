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
  id: number;
  x: number;
  y: number;
  height: number;
  width: number;
};

export const THOUGHT_STATE: ObjectOfNumbers = {
  IDLE: 0,
  SELECTED: 1,
  EDITED: 2,
  DRAGGED: 3,
};

export type ChildPositionData = {
  position: Vector;
  id: number;
};

export type IconProps = {
  color?: string;
};

export type SavedThoughtStateType = {
  children: number[];
  content: string;
  id: number;
  isRootThought: boolean;
  parent: number | undefined;
  prevIsParentOnLeft: boolean;
  x: number;
  y: number;
};

export type SavedStateType = {
  thoughts: SavedThoughtStateType[];
};
