import { createContext } from 'react';
import { makeObservable, observable, action } from 'mobx';
import { requestAnimationFrame } from 'request-animation-frame-polyfill';

import { Thought } from 'classes/Thought';
import { ViewController } from 'classes/ViewController';
import { Pointer } from 'classes/Pointer';
import { Vector, Miniature, THOUGHT_STATE, SavedStateType, SavedThoughtStateType } from 'types/baseTypes';
import { get, getWindowInnerSize, getTwoPointsDistance } from 'utils/get';
import { theme } from 'styles/themeDefault';

type OverlapResult = {
    other: Thought;
    amount: Vector;
    isColliding: boolean;
};

export class GlobalStore {
    connectorsCurveDividerWidth: number;
    defaultSpawnGap: Vector;
    highlight?: Thought;
    isDrawingLocked: boolean;
    isGroupDraggOn: boolean;
    isInitialized: boolean;
    initialThoughtWidth: number;
    pointer: Pointer;
    rootThought: Thought;
    savedMindMap: string;
    scale: number;
    selection?: Thought;
    thoughts: Thought[];
    view?: ViewController;

    constructor() {
        makeObservable(this, {
            savedMindMap: observable,
            thoughts: observable,

            addThought: action,
            loadUploadedMindMap: action,
            saveCurrentMindMapAsJSON: action,
        });

        this.connectorsCurveDividerWidth = 2.2;
        this.defaultSpawnGap = { x: 25, y: 10 };
        this.highlight = undefined;
        this.isDrawingLocked = false;
        this.isGroupDraggOn = true;
        this.isInitialized = false;
        this.initialThoughtWidth = 200;
        this.pointer = new Pointer();
        this.savedMindMap = '';
        this.scale = 1;
        this.selection = undefined;
        this.thoughts = [];
        this.view = undefined;
        this.rootThought = this.addThought({ x: 0, y: 0 }, true, undefined, "What's on your mind?");
        this.setSelection(this.rootThought);

        this.initializeOnce();
    }

    initializeOnce(): void {
        if (!this.isInitialized) {
            window.addEventListener('load', () => {
                const canvas = get<HTMLCanvasElement>('canvas');
                if (canvas) {
                    this.view = new ViewController(canvas);
                    this.updateDocumentSize();
                    window.addEventListener('resize', this.updateDocumentSize);
                    this.view.setThoughtsContainerPosition();
                    this.view.centerMindMap();
                    this.rootThought.setPositionAsync(this.view.getMapCenterCoordinates());
                    this.editSelection();

                    const drawLoop = (): void => {
                        this.draw();
                        requestAnimationFrame(drawLoop);
                    };

                    drawLoop();
                }
            });

            this.isInitialized = true;
        }
    }

    getNewID(): number {
        if (this.thoughts.length > 0) {
            return this.thoughts[this.thoughts.length - 1].id + 1;
        }

        return 0;
    }

    addThought(position: Vector, isRoot?: boolean, parent?: Thought, initText?: string, id?: number): Thought {
        const thought = new Thought(id || this.getNewID(), position, parent, isRoot, initText);
        this.thoughts.push(thought);
        if (isRoot) {
            this.rootThought = thought;
        }

        return thought;
    }

    createChildThought(thought: Thought): void {
        this.stopEditing();
        const targetPosition: Vector = thought.position;
        const sideMod = thought.hasParent() && !thought.isParentOnLeft() ? -1 : 1;
        targetPosition.x +=
            (thought.getOuterWidth() * 0.5 + this.initialThoughtWidth * 0.5 + this.defaultSpawnGap.x) * sideMod;
        const newChild: Thought = this.addThought(targetPosition, false, thought);
        thought.children.push(newChild);
        this.setSelection(newChild);
        this.resolveOverlaps(newChild);
        this.editSelection();
        newChild.refreshPosition();
        thought.saveChildrenRelativePosition();
        setTimeout(() => {
            this.saveCurrentMindMapAsJSON();
        }, 200);
    }

    createSiblingThought(thought: Thought): void {
        this.stopEditing();
        if (!this.selection) return;
        const targetPosition: Vector = thought.position;
        targetPosition.y += thought.getOuterHeight() * 0.5 + 30 + this.defaultSpawnGap.y;
        const newSibling: Thought = this.addThought(targetPosition, false, thought.parent);
        if (thought.parent) thought.parent.addChildThought(newSibling);
        if (this.selection) this.removeIfEmpty(this.selection);
        this.setSelection(newSibling);
        this.resolveOverlaps(newSibling);
        this.editSelection();
        newSibling.refreshPosition();
        if (thought.parent) thought.parent.saveChildrenRelativePosition();
        setTimeout(() => {
            this.saveCurrentMindMapAsJSON();
        }, 200);
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
            setTimeout(() => {
                this.saveCurrentMindMapAsJSON();
            }, 200);
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
        setTimeout(() => {
            this.saveCurrentMindMapAsJSON();
        }, 200);
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
                const targetPosition: Vector = thought.position;
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
        const myPosition = thought.position;
        const overlaps: OverlapResult[] = this.findOverlapsFor(thought);
        let closestIndex = 0;
        let closestDistance = 0;
        if (overlaps.length > 0) {
            overlaps.forEach((overlap: OverlapResult, index: number) => {
                const distance = getTwoPointsDistance(myPosition, overlap.other.position);
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
        }
    }

    getCurrentMindMapState(): SavedStateType {
        return {
            thoughts: this.thoughts.map(
                (t: Thought): SavedThoughtStateType => {
                    const { content, id, isRootThought, prevIsParentOnLeft, x, y } = t;

                    return {
                        children: t.children.map((child) => child.id),
                        content,
                        id,
                        isRootThought,
                        parent: t.parent ? t.parent.id : undefined,
                        prevIsParentOnLeft,
                        x,
                        y,
                    };
                }
            ),
        };
    }

    saveCurrentMindMapAsJSON(): void {
        const data = JSON.stringify(this.getCurrentMindMapState());
        this.savedMindMap = `text/json;charset=utf-8,${encodeURIComponent(data)}`;
    }

    loadUploadedMindMap(saved: SavedStateType): void {
        this.clearHighlight();
        this.clearSelection();
        this.thoughts = [];

        const uploadedThoughts: Thought[] = saved.thoughts.map(
            (t: SavedThoughtStateType): Thought => {
                const { id, x, y, isRootThought, content } = t;
                const restored: Thought = this.addThought({ x, y }, isRootThought, undefined, content, id);

                return restored;
            }
        );

        this.thoughts = uploadedThoughts.map(
            (thought: Thought): Thought => {
                const t = thought;
                const savedThought = saved.thoughts.find((savedT) => savedT.id === t.id);
                if (savedThought) {
                    const parentId = savedThought.parent;
                    if (parentId !== undefined) {
                        const parent = uploadedThoughts.find((potentialParent) => {
                            return potentialParent.id === parentId;
                        });
                        if (parent) {
                            t.setParent(parent);
                        }
                    }
                    if (savedThought.children.length > 0) {
                        savedThought.children.forEach((childId: number): void => {
                            const child = uploadedThoughts.find((potentialChild) => potentialChild.id === childId);
                            if (child) {
                                t.addChildThought(child);
                            }
                        });
                    }
                    t.saveChildrenRelativePosition();
                    t.prevIsParentOnLeft = savedThought.prevIsParentOnLeft;
                    t.state = 0;
                }

                return t;
            }
        );

        this.thoughts.forEach((t: Thought) => {
            t.refreshPosition();
            if (t.isRootThought) {
                const root = this.rootThought;

                root.updateContent(t.content);
                root.id = t.id;
                root.setPositionAsync({ x: t.x, y: t.y }, () => {
                    this.isDrawingLocked = false;
                    this.saveCurrentMindMapAsJSON();
                });
            }
        });
    }

    draw(): void {
        if (this.view && this.view.canvas && !this.isDrawingLocked) {
            this.view.context.translate(0.5, 0.5);
            this.view.context.clearRect(0, 0, this.view.canvas.width, this.view.canvas.height);

            if (this.thoughts.length > 0) {
                const miniatures: Miniature[] = [];
                this.thoughts.forEach((thought) => {
                    const miniature = this.view!.getMiniMapMiniature(thought.position, thought.getSize(), thought.id);
                    miniatures.push(miniature);
                    this.view!.drawMiniature(miniature);
                });

                if (this.rootThought) {
                    const rootChildren: Thought[] = this.rootThought.getChildren(true);
                    const offset: Vector = this.view!.getThoughtsContainerPosition();
                    if (rootChildren.length > 0) {
                        rootChildren.forEach((child: Thought) => {
                            const { me, parent } = child.getConnectorPoints();
                            me.x += offset.x;
                            me.y += offset.y - 1;
                            parent.x += offset.x;
                            parent.y += offset.y - 1;
                            me.x += 1;
                            parent.x -= 1;
                            const { x } = me;
                            const { x: a } = parent;
                            const mod = (x - a) / this.connectorsCurveDividerWidth;
                            const bezierControllPointA = { x: -mod, y: 0 };
                            const bezierControllPointB = { x: mod, y: 0 };
                            this.view!.drawBezierCurve(
                                me,
                                parent,
                                bezierControllPointA,
                                bezierControllPointB,
                                theme.connectorsWidth,
                                theme.colors.connectors()
                            );

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
                                theme.colors.mianitureConnector()
                            );
                        });
                    }
                }
            }
            this.view.context.translate(-0.5, -0.5);
        }
    }
}

const store = new GlobalStore();

export default createContext(store);
