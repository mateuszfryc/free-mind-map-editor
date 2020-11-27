export interface ObjectOfNumbers {
    [key: string]: number;
}

export interface ObjectOfVectors {
    [key: string]: Vector;
}

export type Vector = {
    x: number;
    y: number;
};

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

export type childPositionData = {
    position: Vector;
    id: number;
};
