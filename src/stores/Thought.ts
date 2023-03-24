import { ChildPositionData, ObjectOfVectors, THOUGHT_STATE, Vector } from 'types/baseTypes';
import { getParsedStyle, getWindowInnerSize } from 'utils/get';

const defaultTextTemplate = "What's on your mind?";

type BoundingBox = {
  x: number;
  y: number;
  height: number;
  width: number;
  parent: Thought;
};

/** Thought represents data structure and methods for single mind map item - a single thought. */

export class Thought {
  id: string;
  children: string[];
  childrenRelativePosition: ChildPositionData[];
  closestOverlapId?: string;
  content: string;
  diffX: number;
  diffY: number;
  isMarkedForRemoval: boolean;
  isRootThought: boolean;
  parentId?: string;
  prevIsParentOnLeft: boolean;
  state: number;
  x: number;
  y: number;
  zIndex: number;

  constructor(
    id: string,
    initialPosition: Vector,
    parentId?: string,
    isRootThought = false,
    content: string = defaultTextTemplate,
  ) {
    this.children = [];
    this.childrenRelativePosition = [];
    this.closestOverlapId = undefined;
    this.content = content;
    this.diffX = 0;
    this.diffY = 0;
    this.id = id;
    this.isMarkedForRemoval = false;
    this.isRootThought = isRootThought;
    this.parentId = parentId;
    this.prevIsParentOnLeft = true;
    this.state = THOUGHT_STATE.IDLE;
    this.x = initialPosition.x;
    this.y = initialPosition.y;
    this.zIndex = 2;
  }

  updateContent(value: string): void {
    this.content = value;
  }

  hasParent(): boolean {
    return this.parentId !== undefined;
  }

  getElement(): HTMLElement | null {
    return document.getElementById(`${this.id}`);
  }

  setState(newState: number): void {
    this.state = newState;
  }

  isIdle(): boolean {
    return this.state === THOUGHT_STATE.IDLE;
  }

  isEdited(): boolean {
    return this.state === THOUGHT_STATE.EDITED;
  }

  isBeingDragged(): boolean {
    return this.state === THOUGHT_STATE.DRAGGED;
  }

  getBoundingBox(): BoundingBox {
    const size = this.getOuterSize();
    const { x, y } = this.getPosition();

    return {
      height: size.y,
      width: size.x,
      x: x - size.x * 0.5,
      y: y - size.y * 0.5,
      parent: this,
    };
  }

  getCorners(): {
    top: ObjectOfVectors;
    bottom: ObjectOfVectors;
  } {
    const width: number = this.getOuterWidth() * 0.5;
    const height: number = this.getOuterHeight() * 0.5;
    const { x, y } = this.getPosition();

    return {
      top: {
        left: { x: x - width, y: y - height - 1 },
        right: { x: x + width, y: y - height - 1 },
      },
      bottom: {
        left: { x: x - width, y: y + height - 1 },
        right: { x: x + width, y: y + height - 1 },
      },
    };
  }

  addPosition(positionToAdd: Vector): Thought {
    this.x += positionToAdd.x;
    this.y += positionToAdd.y;
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      const size = this.getOuterSize();
      element.style.left = `${this.x - size.x * 0.5}px`;
      element.style.top = `${this.x - size.y * 0.5}px`;
    }

    return this;
  }

  getPosition(): Vector {
    return {
      x: this.x,
      y: this.y,
    };
  }

  refreshPosition(): void {
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      const size = this.getOuterSize();
      element.style.left = `${this.x - size.x * 0.5}px`;
      element.style.top = `${this.y - size.y * 0.5}px`;
    }
  }

  setPosition(newPosition: Vector): Thought {
    this.x = newPosition.x;
    this.y = newPosition.y;
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      const size = this.getOuterSize();
      element.style.left = `${this.x - size.x * 0.5}px`;
      element.style.top = `${this.y - size.y * 0.5}px`;
    }

    return this;
  }

  getWidth(): number {
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      return getParsedStyle(element, 'width').width;
    }

    return 0;
  }

  getHeight(): number {
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      return getParsedStyle(element, 'height').height;
    }

    return 0;
  }

  getSize(): Vector {
    return {
      x: this.getWidth(),
      y: this.getHeight(),
    };
  }

  getOuterWidth(): number {
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      const style = window.getComputedStyle(element);

      return (
        parseInt(style.width, 10) +
        parseInt(style.paddingLeft, 10) +
        parseInt(style.paddingRight, 10) +
        parseInt(style.marginLeft, 10) +
        parseInt(style.marginRight, 10) +
        parseInt(style.borderLeftWidth, 10) +
        parseInt(style.borderRightWidth, 10)
      );
    }

    return 0;
  }

  getOuterHeight(): number {
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      const style = window.getComputedStyle(element);

      return (
        parseInt(style.height, 10) +
        parseInt(style.paddingTop, 10) +
        parseInt(style.paddingBottom, 10) +
        parseInt(style.marginTop, 10) +
        parseInt(style.marginBottom, 10) +
        parseInt(style.borderTopWidth, 10) +
        parseInt(style.borderBottomWidth, 10)
      );
    }

    return 0;
  }

  getOuterSize(): Vector {
    const width = this.getOuterWidth();
    const height = this.getOuterHeight();

    return {
      x: width,
      y: height,
    };
  }

  setParent(newParentId: string): void {
    this.parentId = newParentId;
  }

  clearParent(): void {
    this.parentId = undefined;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  hasValue(): boolean {
    return this.content !== '';
  }

  hasDefaultValue(): boolean {
    return this.content !== defaultTextTemplate;
  }

  setOnTop(): Thought {
    this.zIndex = 3;

    return this;
  }

  resetZIndex(): Thought {
    this.zIndex = 2;

    return this;
  }

  markForRemoval(): void {
    this.isMarkedForRemoval = true;
  }

  setPrevIsParentOnLeft(isOnTheLeft: boolean): void {
    this.prevIsParentOnLeft = isOnTheLeft;
  }

  setClosestOverlap(thoughtId: string): void {
    this.closestOverlapId = thoughtId;
  }

  clearClosestOverlap(): void {
    this.closestOverlapId = undefined;
  }

  setPointerPositionDiff(x: number, y: number): void {
    this.diffX = this.x - x;
    this.diffY = this.y - y;
  }

  isFullyWithinViewport(): boolean {
    const element = this.getElement();

    if (!element) {
      throw new Error('Could not get reference to item element');
    }

    const { x, y } = element.getBoundingClientRect();
    const size = getWindowInnerSize();

    return x >= 0 && y >= 0 && x < size.x - element.clientWidth && y < size.y - element.clientHeight;
  }

  /*
    Return offset of the given thought in relation to viewport.
    If position is outside of left or top the axis value will be below 0.
    If position is outside of right or bottom it will be higher than zero.
    If thought element is fully inside viewport axis value will be 0.
  */
  getViewportOffset(): Vector {
    const element = this.getElement();

    if (!element) {
      window.console.log('nope');

      return { x: 0, y: 0 };
    }

    const position = element.getBoundingClientRect();
    const size = getWindowInnerSize();
    const right = size.x - element.clientWidth;
    const bottom = size.y - element.clientHeight;

    let x = 0;
    let y = 0;

    if (position.x < 0) x = position.x;
    else if (position.x > right) x = position.x - right;

    if (position.y < 0) y = position.y;
    else if (position.y > bottom) y = position.y - bottom;

    return {
      x,
      y,
    };
  }

  static clone(thought: Thought): Thought {
    const clone = new Thought(thought.id, { x: thought.x, y: thought.y }, thought.parentId);

    clone.children = thought.children;
    clone.childrenRelativePosition = thought.childrenRelativePosition;
    clone.closestOverlapId = thought.closestOverlapId;
    clone.content = thought.content;
    clone.diffX = thought.diffX;
    clone.diffY = thought.diffY;
    clone.isMarkedForRemoval = thought.isMarkedForRemoval;
    clone.isRootThought = thought.isRootThought;
    clone.prevIsParentOnLeft = thought.prevIsParentOnLeft;
    clone.state = thought.state;
    clone.zIndex = thought.zIndex;

    return clone;
  }
}
