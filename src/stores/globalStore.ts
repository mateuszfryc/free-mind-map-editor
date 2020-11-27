import { createContext } from 'react';
import { makeObservable, observable } from 'mobx';

import { Thought } from 'classes/Thought';
import { ViewController } from 'classes/ViewController';
import { Pointer } from 'classes/Pointer';
import { Vector, Miniature, THOUGHT_STATE } from 'types/baseTypes';
import { get, getWindowInnerSize, getTwoPointsDistance } from 'utils/get';

type OverlapResult = {
    other: Thought;
    amount: Vector;
    isColliding: boolean;
};

export class GlobalStore {
    connectorsCurveDividerWidth: number;
    defaultSpawnGap: Vector;
    highlight?: Thought;
    isGroupDraggOn: boolean;
    initialThoughtWidth: number;
    pointer: Pointer;
    rootThought: Thought;
    scale: number;
    selection?: Thought;
    thoughts: Thought[];
    view?: ViewController;

    constructor() {
        makeObservable(this, {
            thoughts: observable,
        });

        this.connectorsCurveDividerWidth = 2.2;
        this.defaultSpawnGap = { x: 25, y: 10 };
        this.highlight = undefined;
        this.isGroupDraggOn = true;
        this.initialThoughtWidth = 200;
        this.pointer = new Pointer();
        this.scale = 1;
        this.selection = undefined;
        this.thoughts = [];
        this.view = undefined;
        this.rootThought = this.addThought({ x: 0, y: 0 }, true, undefined, "What's on your mind?");
        this.setSelection(this.rootThought);
    }

    getNewID(): number {
        if (this.thoughts) {
            return this.thoughts.length + 1;
        }
        return 0;
    }

    addThought(position: Vector, isRoot?: boolean, parent?: Thought, initText?: string): Thought {
        const thought = new Thought(this.getNewID(), position, parent, isRoot, initText);
        this.thoughts.push(thought);
        if (isRoot) {
            this.rootThought = thought;
        }

        return thought;
    }

    createChildThought(thought: Thought): Thought {
        this.stopEditing();
        const targetPosition: Vector = thought.getPosition();
        targetPosition.x += thought.getOuterWidth() * 0.5 + this.initialThoughtWidth * 0.5 + this.defaultSpawnGap.x;
        const newChild: Thought = this.addThought(targetPosition, false, thought);
        thought.children.push(newChild);
        this.setSelection(newChild);
        this.resolveOverlaps(newChild);
        this.editSelection();
        newChild.refreshPosition();
        this.draw();

        return newChild;
    }

    createSiblingThought(thought: Thought): void {
        this.stopEditing();
        if (!this.selection) return;
        const targetPosition: Vector = thought.getPosition();
        targetPosition.y += thought.getOuterHeight() * 0.5 + 30 + this.defaultSpawnGap.y;
        const newSibling: Thought = this.addThought(targetPosition, false, thought.parent);
        if (thought.parent) thought.parent.addChildThought(newSibling);
        if (this.selection) this.removeIfEmpty(this.selection);
        this.setSelection(newSibling);
        this.resolveOverlaps(newSibling);
        this.editSelection();
        newSibling.refreshPosition();
        this.draw();
    }

    setHighlight(thought: Thought): void {
        this.highlight = thought;
    }

    clearHighlight(): void {
        this.highlight = undefined;
    }

    setSelection(thought: Thought): void {
        this.selection?.setState(THOUGHT_STATE.IDLE);
        this.selection = thought;
        this.selection.setState(THOUGHT_STATE.SELECTED);
    }

    clearSelection(): void {
        if (this.selection) {
            if (!this.selection.hasValue() && !this.selection.isRootThought) {
                this.removeThought(this.selection);
                return;
            }
            if (this.selection.isEdited()) {
                this.stopEditing();
            }
            this.selection.setState(THOUGHT_STATE.IDLE);
            this.selection = undefined;
            this.draw();
        }
    }

    stopEditing(): void {
        if (this.selection) {
            if (!this.selection.hasValue() && this.selection.id !== this.rootThought.id) {
                this.removeThought(this.selection);
                return;
            }
            this.selection.setState(THOUGHT_STATE.SELECTED);
            this.resolveOverlaps(this.selection);
            this.selection.refreshPosition();
            this.draw();
        }
    }

    setIsGroupDraggOn(isOn: boolean): void {
        this.isGroupDraggOn = isOn;
    }

    removeThought(thought: Thought): void {
        thought.markeForRemoval();
        if (this.highlight && this.highlight.id === thought.id) {
            this.highlight = undefined;
        }
        if (this.selection && this.selection.id === thought.id) {
            this.selection = undefined;
        }
        thought.children.forEach((child) => {
            this.removeThought(child);
        });
        this.thoughts = this.thoughts.filter((item: Thought) => {
            return item.id !== thought.id;
        });
        if (thought.hasParent()) {
            thought.parent!.removeChildThought(thought);
        }
        this.draw();
    }

    removeIfEmpty(thought: Thought): void {
        if (!thought.hasValue()) {
            this.removeThought(thought);
        }
    }

    editSelection(): void {
        if (this.selection) {
            this.selection.setState(THOUGHT_STATE.EDITED);
            this.selection.refreshPosition();
        }
    }

    updateSelectionContent(value: string): void {
        if (this.selection) {
            this.selection.updateContent(value);
        }
    }

    isOverlappingWith(thought: Thought, other: Thought): OverlapResult {
        const { width, height, x, y } = thought.getBoundingBox();
        const { x: a, y: b, width: otherWidth, height: otherHeight } = other.getBoundingBox();
        const isColliding = x + width >= a && y + height >= b && y <= b + otherHeight && x <= a + otherWidth;
        const result = {
            amount: { x: 0, y: 0 },
            isColliding,
            other,
        };
        if (isColliding) {
            result.amount = {
                x: -x + a + width,
                y: -y + b + height,
            };
        }

        return result;
    }

    findOverlapsFor(thought: Thought): OverlapResult[] {
        const overlaps: OverlapResult[] = [];
        this.thoughts.forEach((otherThought: Thought) => {
            if (otherThought.id !== thought.id) {
                const result = this.isOverlappingWith(thought, otherThought);

                if (result.isColliding) {
                    overlaps.push(result);
                }
            }
        });

        return overlaps;
    }

    resolveOverlaps(thought: Thought, axis = 'y'): Thought {
        const overlaps: OverlapResult[] = this.findOverlapsFor(thought);
        if (overlaps.length > 0) {
            const { amount } = overlaps[0];
            if (amount.x > 0 || amount.y > 0) {
                const targetPosition: Vector = thought.getPosition();
                if (axis === 'y') {
                    targetPosition.x += amount[axis] + Math.sign(amount[axis]) * this.defaultSpawnGap[axis];
                } else if (axis === 'x') {
                    targetPosition.y += amount[axis] + Math.sign(amount[axis]) * this.defaultSpawnGap[axis];
                }
                thought.setPosition(targetPosition);
                this.resolveOverlaps(thought, 'y');
            }
        }

        return thought;
    }

    findClosestOverlapFor(thought: Thought): void {
        const myPosition = thought.getPosition();
        const overlaps: OverlapResult[] = this.findOverlapsFor(thought);
        let closestIndex = 0;
        let closestDistance = 0;
        if (overlaps.length > 0) {
            overlaps.forEach((overlap: OverlapResult, index: number) => {
                const distance = getTwoPointsDistance(myPosition, overlap.other.getPosition());
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            thought.setClosestOverlap(overlaps[closestIndex].other);

            return;
        }

        thought.clearClosestOverlap();
    }

    savePointerPositionDiff(thought: Thought): Thought {
        thought.setPointerPositionDiff(thought.x - this.pointer.position.x, thought.y - this.pointer.position.y);

        return thought;
    }

    updateDocumentSize(): void {
        if (this.view) {
            const { x, y } = getWindowInnerSize();
            const body = document.body as HTMLElement;
            const mindmap = get<HTMLElement>('#mindmap')!;
            const canvas = this.view.canvas as HTMLElement;
            const elements: HTMLElement[] = [body, mindmap, canvas];
            elements.forEach((element: HTMLElement) => {
                element.setAttribute('width', `${x}`);
                element.setAttribute('height', `${y}`);
                element.setAttribute('style', `width: ${x}px; height: ${y}px`);
            });
            this.view.setMiniMapViewportProportionalSize();
            this.draw();
        }
    }

    draw(): void {
        if (this.view && this.view.canvas) {
            this.view.context.clearRect(0, 0, this.view.canvas.width, this.view.canvas.height);

            if (this.thoughts.length > 0) {
                const miniatures: Miniature[] = [];
                this.thoughts.forEach((thought) => {
                    const miniature = this.view!.getMiniMapMiniature(
                        thought.getPosition(),
                        thought.getSize(),
                        thought.id
                    );
                    miniatures.push(miniature);
                    this.view!.drawMiniature(miniature);
                });

                if (this.rootThought) {
                    const rootChildren: Thought[] = this.rootThought.getChildren(true);
                    if (rootChildren.length > 0) {
                        rootChildren.forEach((child: Thought) => {
                            const { me, parent } = child.getConnectorPoints();
                            const offset: Vector = this.view!.getThoughtsContainerPosition();
                            me.x += offset.x;
                            me.y += offset.y - 0.3;
                            parent.x += offset.x;
                            parent.y += offset.y - 0.3;
                            me.x += 1;
                            parent.x -= 1;
                            const { x } = me;
                            const { x: a } = parent;
                            const mod = (x - a) / this.connectorsCurveDividerWidth;
                            const bezierControllPointA = { x: -mod, y: 0 };
                            const bezierControllPointB = { x: mod, y: 0 };
                            this.view!.drawBezierCurve(me, parent, bezierControllPointA, bezierControllPointB);

                            // draw miniatures connectors
                            const myMiniature = miniatures.filter((mini) => mini.id === child.id)[0];
                            const parentMiniature = miniatures.filter((mini) => mini.id === child.parent!.id)[0];
                            const xStart =
                                myMiniature.x > parentMiniature.x ? myMiniature.x : myMiniature.x + myMiniature.width;
                            const yStart = myMiniature.y + myMiniature.height * 0.5;
                            const xEnd =
                                myMiniature.x > parentMiniature.x
                                    ? parentMiniature.x + parentMiniature.width
                                    : parentMiniature.x;
                            const yEnd = parentMiniature.y + parentMiniature.height * 0.5;
                            const miniatureMod = (xStart - xEnd) / this.connectorsCurveDividerWidth;
                            const miniatureControllPointA = { x: -miniatureMod, y: 0 };
                            const miniatureControllPointB = { x: miniatureMod, y: 0 };
                            this.view!.drawBezierCurve(
                                { x: xStart, y: yStart },
                                { x: xEnd, y: yEnd },
                                miniatureControllPointA,
                                miniatureControllPointB,
                                1,
                                'black'
                            );
                        });
                    }
                }
            }
        }
    }
}

const store = new GlobalStore();

window.addEventListener('load', () => {
    const canvas = get<HTMLCanvasElement>('canvas');
    if (canvas) {
        store.view = new ViewController(canvas);
        store.updateDocumentSize();
        window.addEventListener('resize', store.updateDocumentSize);
        store.view.setThoughtsContainerPosition();
        store.view.centerMindMap();
        store.rootThought.setPositionAsync(store.view.getMapCenterCoordinates(), (): void => {
            store.draw();
        });
        store.editSelection();
        store.draw();
    }
});

export default createContext(store);
