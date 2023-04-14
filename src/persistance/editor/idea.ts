import { ChildPositionData, NODE_STATE, ObjectOfVectors, Vector } from 'persistance/editor/base-types';
import { getParsedStyle, getWindowInnerSize } from 'view/utils/get';

export const defaultTextTemplate = 'New idea';

type BoundingBox = {
  x: number;
  y: number;
  height: number;
  width: number;
  parent: Idea;
};

/*
  Node represents data structure and methods
  for single mind map item - a single idea o thought.
*/

export class Idea {
  id: string;
  children: string[];
  childrenRelativePosition: ChildPositionData[];
  closestOverlapId?: string;
  content: string;
  diffX: number;
  diffY: number;
  isMarkedForRemoval: boolean;
  isRootNode: boolean;
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
    isRootNode = false,
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
    this.isRootNode = isRootNode;
    this.parentId = parentId;
    this.prevIsParentOnLeft = true;
    this.state = NODE_STATE.IDLE;
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
    return this.state === NODE_STATE.IDLE;
  }

  isEdited(): boolean {
    return this.state === NODE_STATE.EDITED;
  }

  isBeingDragged(): boolean {
    return this.state === NODE_STATE.DRAGGED;
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
    // const height: number = this.getOuterHeight() * 0.5;
    const { x, y } = this.getPosition();

    return {
      top: {
        left: { x: x - width, y: y /* - height - 1 */ },
        right: { x: x + width, y: y /* - height - 1 */ },
      },
      bottom: {
        left: { x: x - width, y: y /* + height - 1 */ },
        right: { x: x + width, y: y /* + height - 1 */ },
      },
    };
  }

  addPosition(positionToAdd: Vector): Idea {
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

  getViewportPosition(): Vector {
    const element: HTMLElement | null = this.getElement();
    if (!element) return new Vector();

    const position = element.getBoundingClientRect();

    return {
      x: position.x + position.width * 0.5,
      y: position.y + position.height * 0.5,
    };
  }

  setPosition(newPosition: Vector): Idea {
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

  refreshPosition(): void {
    const element: HTMLElement | null = this.getElement();
    if (element !== null) {
      const size = this.getOuterSize();
      element.style.left = `${this.x - size.x * 0.5}px`;
      element.style.top = `${this.y - size.y * 0.5}px`;
    }
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

  setOnTop(): Idea {
    this.zIndex = 3;

    return this;
  }

  resetZIndex(): Idea {
    this.zIndex = 2;

    return this;
  }

  markForRemoval(): void {
    this.isMarkedForRemoval = true;
  }

  setPrevIsParentOnLeft(isOnTheLeft: boolean): void {
    this.prevIsParentOnLeft = isOnTheLeft;
  }

  setClosestOverlap(nodeId: string): void {
    this.closestOverlapId = nodeId;
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
    Return offset of the given node in relation to viewport.
    If position is outside of left or top the axis value will be below 0.
    If position is outside of right or bottom it will be higher than zero.
    If node element is fully inside viewport axis value will be 0.
  */
  getViewportOffset(): Vector {
    const element = this.getElement();

    if (!element) {
      window.console.log('nope');

      return new Vector();
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

  static clone(node: Idea): Idea {
    const clone = new Idea(node.id, { x: node.x, y: node.y }, node.parentId);

    clone.children = node.children;
    clone.childrenRelativePosition = node.childrenRelativePosition;
    clone.closestOverlapId = node.closestOverlapId;
    clone.content = node.content;
    clone.diffX = node.diffX;
    clone.diffY = node.diffY;
    clone.isMarkedForRemoval = node.isMarkedForRemoval;
    clone.isRootNode = node.isRootNode;
    clone.prevIsParentOnLeft = node.prevIsParentOnLeft;
    clone.state = node.state;
    clone.zIndex = node.zIndex;

    return clone;
  }
}
