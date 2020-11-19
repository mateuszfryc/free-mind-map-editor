(function() {

    const THOUGHT_STATE = {
        IDLE        : 0,
        HIGHLIGHTED : 1,
        SELECTED    : 2,
        EDITED      : 3,
        DRAGGED     : 4,
    }

    class Thought {
        constructor(
            position,
            parent        = undefined,
            isRootThought = false,
            defaultText   = '',
        ) {
            const lastThought = store.thoughts[store.thoughts.length - 1];

            this.children = [];
            this.childrenRelativePosition = [];
            this.closestOverlap = undefined;
            this.element = new ThoughtVisual(this, defaultText, isRootThought);
            this.id = lastThought ? lastThought.id + 1 : 0;
            this.mousePositionDiff = new Vector();
            this.parent = parent;
            this.position = new Vector();
            this.savedSize = new Vector();
            this.state = THOUGHT_STATE.IDLE;
            this.prevIsParentOnLeft = undefined;
            
            this.setPosition(position);
            store.thoughts.push(this);
        }
    
        getElement() {
            return this.element.getElement();
        }

        isIdle() {
            return this.state === THOUGHT_STATE.IDLE;
        }

        isSelected() {
            return this.state === THOUGHT_STATE.SELECTED;
        }

        isEdited() {
            return this.state === THOUGHT_STATE.EDITED;
        }

        isBeingDragged() {
            return this.state === THOUGHT_STATE.DRAGGED;
        }
    
        getBoundingBox() {
            const { width, height } = this.element.getOuterSize();
            const { x, y } = this.getPosition();
    
            return new BoundingBox(
                x - (width * 0.5),
                y - (height * 0.5),
                width,
                height,
                this,
            )
        }
    
        findOverlaps(returnFirstOnly = false) {
            const myBounds = this.getBoundingBox();
            let overlaps = [];

            store.thoughts.forEach(thought => {
                if (thought.id !== this.id) {
                    const otherBounds = thought.getBoundingBox();
                    const result = myBounds.isOverlappingWith(otherBounds);

                    if (result) {
                        overlaps.push(result);
                    }
                }
            });

            if (overlaps.length > 0) {
                if (returnFirstOnly) {
                    return overlaps[0];
                }

                return overlaps;
            }

            return false;
        }

        findClosestOverlap() {
            const myPosition = this.getPosition();
            const overlaps = this.findOverlaps();
            let closestIndex = 0;
            let closestDistance = 0;

            if (overlaps) {
                overlaps.forEach((overlap, index) => {
                    const otherPosition = overlap.other.getPosition();
                    const distance = get.twoPointsDistance(myPosition, otherPosition);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    } 
                });
                return overlaps[closestIndex].other;
            }

            return false;
        }
    
        resolveOverlaps(axis = 'y') {
            const me = this;
            const overlap = this.findOverlaps(true);
    
            if (overlap) {
                const { amount } = overlap;
                const targetPosition = me.getPosition();
                targetPosition[axis] += amount[axis] + (Math.sign(amount[axis]) * store.defaultSpawnGap[axis]);
                me.setPosition(targetPosition);
                me.resolveOverlaps('y');
            }

            return this;
        }

        getCorners() {
            const width = this.element.getOuterWidth() * 0.5;
            const height = this.element.getOuterHeight() * 0.5;
            const { x, y } = this.getPosition();
    
            return {
                top: {
                    left: new Vector(x - width, y - height - 1),
                    right: new Vector(x + width, y - height - 1),
                },
                bottom: {
                    left: new Vector(x - width, y + height - 1),
                    right: new Vector(x + width, y + height - 1),
                },
            }
        }
    
        getConnectorPoints() {
            const parent = this.getParentThought();
            const grandParent = parent.getParentThought();
            const isParentsOnLeft = parent.getPosition().x < this.getPosition().x;
            const isParentsOutOnLeft = grandParent
                ? grandParent.getPosition().x < parent.getPosition().x
                : isParentsOnLeft;
            
            const myCorners = this.getCorners();
            const parentCorners = this.parent.getCorners();

            return {
                me: isParentsOnLeft ? myCorners.bottom.left : myCorners.bottom.right,
                parent: isParentsOutOnLeft ? parentCorners.bottom.right : parentCorners.bottom.left,
            }
        }
    
        isParentOnLeft() {
            const { x } = this.getPosition();
            const { x: a } = this.getParentThought().getPosition();
    
            return a < x;
        }
    
        updatePosition() {
            const element = this.element;
            const { x, y } = this.getPosition();
            const { width, height } = element.getOuterSize(true);
            const newX = (x - width) * store.scale;
            const newY = (y - height) * store.scale;
            element.setPosition(newX, newY);
            this.saveMousePositionDiff();

            return this;
        }
    
        setPosition(newPosition) {
            this.position.setV(newPosition);
            this.updatePosition();

            return this;
        }
    
        addPosition(positionToAdd) {
            this.position.addV(positionToAdd);
            this.updatePosition();

            return this;
        }
    
        getPosition() {
            return this.position.getCopy();
        }
    
        getSize() {
            return new Vector(
                this.element.getWidth(),
                this.element.getHeight(),
            )
        }

        getParentThought() {
            return this.parent;
        }

        getHeadOfTheFamily() {
            const parent = this.getParentThought();
            if (!parent || parent.id === store.rootThought.id) return this;

            let headCandidate = parent;

            while(headCandidate.getParentThought().id !== store.rootThought.id) {
                headCandidate = headCandidate.getParentThought();
            }

            return headCandidate;
        }
    
        saveCurrentSize() {
            const { width, height } = this.element.getSize();
            this.savedSize.set(width, height);

            return this;
        }
    
        saveMousePositionDiff() {
            this.mousePositionDiff = this.getPosition().subtract(mouse.getPosition());

            return this;
        }

        saveChildrenRelativePosition() {
            if (this.children.length < 1) return this;

            const myPosition = this.getPosition();
            this.childrenRelativePosition = this.getChildren(true).map(child => {
                const position = child.getPosition().subtract(myPosition);
                position.id = child.id;

                return position;
            });

            return this;
        }

        restoreChildrenRelativePosition() {
            if (this.children.length < 1) return this;

            const myPosition = this.getPosition();
            const allChildren = this.getChildren(true);
            this.childrenRelativePosition.forEach(position => {
                const actionedChild = allChildren.find(child => child.id === position.id)
                if (actionedChild) {
                    actionedChild.setPosition(myPosition.getCopy().addV(position));
                }
            });

            return this;
        }
    
        createChildThought() {
            const myPosition = this.getPosition();
            const newChild = new Thought(myPosition, this);
            const widthHalf = this.element.getOuterWidth() * 0.5;
            const childWidthHalf = newChild.element.getOuterWidth() * 0.5;
            newChild.addPosition(new Vector(widthHalf + childWidthHalf + store.defaultSpawnGap.x, 0));
            newChild.prevIsParentOnLeft = newChild.isParentOnLeft();
            this.children.push(newChild);

            return newChild;
        }
    
        createSiblingThought() {
            const myPosition = this.getPosition();
            const newSibling = new Thought(myPosition, this.parent);
            const heightHalf = this.element.getOuterHeight() * 0.5;
            const childHeightHalf = newSibling.element.getOuterHeight() * 0.5;
            newSibling.addPosition(new Vector(0, heightHalf + childHeightHalf + store.defaultSpawnGap.y));
            newSibling.prevIsParentOnLeft = newSibling.isParentOnLeft();
            this.parent.children.push(newSibling);

            return newSibling;
        }

        addChildThought(child) {
            if (this.children.every(myChild => myChild.id !== child.id)) {
                this.children.push(child);
                child.parent = this;
            }

            return this;
        }
    
        removeChildThought(childToBeRemoved) {
            this.children = this.children.filter(child => {
                return child.id !== childToBeRemoved.id;
            });
            childToBeRemoved.parent = undefined;

            return this;
        }
    
        hasChildren() {
            return this.children.length > 0;
        }
    
        getChildren(includeGrandChildren = false) {
            if (this.children.length < 1 ) return [];

            if (includeGrandChildren) {
                return this.children.reduce((acc, val) => {
                    const subChildren = val.getChildren(true);
                    return acc.concat(val, subChildren)
                }, []);
            }
    
            return this.children;
        }
    
        hasParent() {
            return this.parent !== undefined;
        }

        isParentOf(unknownChild, includeGrandChildren = false) {
            if (!unknownChild) return false;

            if (includeGrandChildren) {
                return this.getChildren(true).some(child => child.id === unknownChild.id);
            }
            return this.children.some(child => child.id === unknownChild.id);
        }

        isChildOf(unknownParent) {
            return unknownParent && unknownParent.children.some(child => child.id === this.id);
        }
    
        removeSelf() {
            const me = this;
            this.children.forEach(child => {
                child.removeSelf();
            });
            this.getElement().remove();
            store.thoughts = store.thoughts.filter(thought => {
                return thought.id !== me.id;
            })
            if (this.parent) {
                this.parent.removeChildThought(me);
                draw.connectors();
            };
        }
    
        select() {
            if (store.selection && store.selection.id !== this.id) store.selection.unselect();
            this.getElement().className += ' selected';
            this.saveMousePositionDiff();
            this.saveCurrentSize();
            this.state = THOUGHT_STATE.SELECTED;
            store.selection = this;

            return this;
        }
    
        unselect() {
            if (this.isEdited()) this.stopEditing();
            const element = this.getElement();
            element.className = element.className.replace(/\s*selected\s*/g, '');
            this.state = THOUGHT_STATE.IDLE;
            store.selection = undefined;

            return this;
        }
    
        insertTextarea() {
            const me = this;
            const parent = this.element;
            const parentStyle = parent.getStyle();
            const element = parent.getElement();
            const textarea = document.createElement('textarea');
            const width = parent.getOuterWidth();
            const height = parent.getOuterHeight();
            textarea.id = this.id;
            textarea.className = 'thought-textarea';
            textarea.value = parent.getValue();
            textarea.style.width = width
                ? width < 120
                    ? `${120}px`
                    : `${width}px`
                : parentStyle.maxWidth;
            textarea.style.height = height
                ? height < 20
                    ? `${20}px`
                    : `${height}px`
                : parentStyle.lineHeight;
            textarea.getThought = function() {
                return me;
            }
    
            function resize() {
                const textHeight = parseInt(textarea.scrollHeight);
                const parentHeight = parent.getHeight();
                if (textHeight >  parentHeight) {
                    textarea.style.height = `${textHeight}px`;
                    parent.setHeight(textHeight);
                }
                
            }
    
            /* 0 timeout to get text after its value was changed */
            function delayedResize () {
                window.setTimeout(resize, 1);
            }
    
            textarea.on('change', resize);
            textarea.on('cut',    delayedResize);
            textarea.on('paste',  delayedResize);
            textarea.on('drop',   delayedResize);
    
            on('keydown', event => {
                if (isKeyBindToAction(event)) {
                    return;
                }
                delayedResize();
            });
    
            element.innerHTML = '';
            element.appendChild(textarea);
            textarea.focus();
        }
    
        edit() {
            if (this.isIdle()
                && store.selection
                && store.selection.id !== this.id) {
                    this.select();
                }
            const element = this.getElement();
            this.insertTextarea();
            this.state = THOUGHT_STATE.EDITED;

            return this;
        }
    
        stopEditing() {
            const value = this.element.getValue();
            if (value === '') {
                this.removeSelf();
                return false;
            }
            const element = this.getElement();
            element.innerHTML = value;
            element.style.height = '';
            this.updatePosition();
            draw.connectors();

            return this;
        }

        dragg() {
            this.state = THOUGHT_STATE.DRAGGED;
        }

        stopDragging() {
            this.state = THOUGHT_STATE.SELECTED;
        }
    }

    window.Thought = Thought;

})();
