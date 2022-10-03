import { action, makeObservable, observable } from 'mobx';

import { childPositionData, ObjectOfVectors, THOUGHT_STATE, Vector } from 'types/baseTypes';
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
    children: Thought[];
    childrenRelativePosition: childPositionData[];
    closestOverlap?: Thought;
    content: string;
    diffX: number;
    diffY: number;
    id: number;
    isMarkedForRemoval: boolean;
    isRootThought: boolean;
    parent?: Thought;
    prevIsParentOnLeft: boolean;
    state: number;
    x: number;
    y: number;
    zIndex: number;

    constructor(
        id: number,
        initialPosition: Vector,
        parent?: Thought,
        isRootThought = false,
        defaultText: string = defaultTextTemplate
    ) {
        makeObservable(this, {
            content: observable,
            children: observable,
            id: observable,
            parent: observable,
            state: observable,
            zIndex: observable,

            resetZIndex: action,
            setOnTop: action,
            setParent: action,
            setState: action,
            updateContent: action,
        });

        this.children = [];
        this.childrenRelativePosition = [];
        this.closestOverlap = undefined;
        this.content = defaultText;
        this.diffX = 0;
        this.diffY = 0;
        this.id = id;
        this.isMarkedForRemoval = false;
        this.isRootThought = isRootThought;
        this.parent = parent;
        this.prevIsParentOnLeft = true;
        this.state = THOUGHT_STATE.EDITED;
        this.x = initialPosition.x;
        this.y = initialPosition.y;
        this.zIndex = 2;

        this.setPositionAsync(initialPosition);
    }

    updateContent(value: string): void {
        this.content = value;
    }

    hasParent(): boolean {
        return this.parent !== undefined;
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
        const { x, y } = this.position;

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
        const { x, y } = this.position;

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

    getConnectorPoints(): ObjectOfVectors {
        const isParentsOnLeft = this.parent ? this.parent.x < this.x : false;
        const grandParent = this.parent!.parent;
        const isParentsOutOnLeft = grandParent ? grandParent.x < this.parent!.x : isParentsOnLeft;

        const myCorners = this.getCorners();
        const parentCorners = this.parent!.getCorners();

        return {
            me: isParentsOnLeft ? myCorners.bottom.left : myCorners.bottom.right,
            parent: isParentsOutOnLeft ? parentCorners.bottom.right : parentCorners.bottom.left,
        };
    }

    isParentOnLeft(): boolean {
        if (this.parent) {
            return this.parent.x < this.x;
        }

        return false;
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

    get position(): Vector {
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

    setPositionAsync(newPosition: Vector, callback?: () => void): void {
        setTimeout(() => {
            if (this.getElement()) {
                this.setPosition(newPosition);
                if (this.parent) this.prevIsParentOnLeft = this.isParentOnLeft();
                if (callback) {
                    callback();
                }
            } else {
                setTimeout(() => this.setPositionAsync(newPosition), 20);
            }
        }, 20);
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

    saveChildrenRelativePosition(): Thought {
        if (this.children.length < 1) return this;

        const myPosition = this.position;
        this.childrenRelativePosition = this.getChildren(true).map(
            (child: Thought): childPositionData => {
                let { x, y } = child.position;
                x -= myPosition.x;
                y -= myPosition.y;

                return { position: { x, y }, id: child.id };
            }
        );

        return this;
    }

    restoreChildrenRelativePosition(): Thought {
        if (this.children.length < 1) return this;

        const myPosition = this.position;
        const allChildren = this.getChildren(true);
        this.childrenRelativePosition.forEach((positionData): void => {
            const actionedChild = allChildren.find((child) => child.id === positionData.id);
            if (actionedChild) {
                actionedChild.setPosition({
                    x: myPosition.x + positionData.position.x,
                    y: myPosition.y + positionData.position.y,
                });
            }
        });

        return this;
    }

    addChildThought(child: Thought): Thought {
        if (this.children.every((myChild) => myChild.id !== child.id)) {
            this.children.push(child);
            child.setParent(this);
        }

        return this;
    }

    setParent(newParent: Thought): void {
        this.parent = newParent;
    }

    clearParent(): void {
        this.parent = undefined;
    }

    removeChildThought(childToBeRemoved: Thought): Thought {
        this.children = this.children.filter((child) => child.id !== childToBeRemoved.id);
        childToBeRemoved.clearParent();

        return this;
    }

    hasChildren(): boolean {
        return this.children.length > 0;
    }

    getChildren(includeGrandChildren = false): Thought[] {
        if (this.children.length < 1) return [];

        if (includeGrandChildren) {
            return this.children.reduce((acc: Thought[], val: Thought) => {
                acc.push(val);

                return acc.concat(val.getChildren(true));
            }, []);
        }

        return this.children;
    }

    isParentOf(unknownChild: Thought, includeGrandChildren = false): boolean {
        if (!unknownChild) return false;

        if (includeGrandChildren) {
            return this.getChildren(true).some((child) => child.id === unknownChild.id);
        }

        return this.children.some((child) => child.id === unknownChild.id);
    }

    isChildOf(unknownParent: Thought): boolean {
        return unknownParent && unknownParent.children.some((child) => child.id === this.id);
    }

    hasValue(): boolean {
        return this.content !== '' && this.content !== defaultTextTemplate;
    }

    setOnTop(): Thought {
        this.zIndex = 3;

        return this;
    }

    resetZIndex(): Thought {
        this.zIndex = 2;

        return this;
    }

    markeForRemoval(): void {
        this.isMarkedForRemoval = true;
    }

    setPrevIsParentOnLeft(isOnTheLeft: boolean): void {
        this.prevIsParentOnLeft = isOnTheLeft;
    }

    setClosestOverlap(thought: Thought): void {
        this.closestOverlap = thought;
    }

    clearClosestOverlap(): void {
        this.closestOverlap = undefined;
    }

    setPointerPositionDiff(x: number, y: number): void {
        this.diffX = this.x - x;
        this.diffY = this.y - y;
    }

    isFullyWithinViewport(): boolean {
        const element = this.getElement();

        if (!element) {
            window.console.log('nope');

            return false;
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
}
