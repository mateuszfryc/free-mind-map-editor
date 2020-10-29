(function() {

    const THOUGHT_STATE = {
        IDLE        : 0,
        HIGHLIGHTED : 1,
        SELECTED    : 2,
        EDITED      : 3,
    }

    class Thought {
        constructor(
            position,
            parent = undefined,
            defaultText = 'Type your idea',
        ) {
            this.parent = parent;
            const lastThought = store.thoughts[store.thoughts.length - 1];
            this.id = lastThought ? lastThought.id + 1 : 0;
            this.element = new ThoughtVisual(this, defaultText);
            this.position = new Vector();
            this.mousePositionDiff = new Vector();
            this.savedSize = new Vector();
            this.children = [];
            this.state = THOUGHT_STATE.IDLE;
            
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
    
        getBoundingRectangle() {
            const { width, height } = this.element.getOuterSize();
            const { x, y } = this.getPosition();
    
            return new Rectangle(
                x - (width * 0.5),
                y - (height * 0.5),
                width,
                height,
                this,
            )
        }
    
        isOverlappingOther(other) {
            const myBounds = this.getBoundingRectangle();
            const otherBounds = other.getBoundingRectangle();
    
            return myBounds.isOverlappingWith(otherBounds);
        }
    
        findOverlaps() {
            const overlaps = [];
            store.thoughts.forEach(thought => {
                if (thought.id !== this.id) {
                    const result = this.isOverlappingOther(thought);
                    if (result) {
                        overlaps.push(result);
                    }
                }
            });
    
            return overlaps;
        }
    
        resolveOverlaps() {
            const me = this;
            const overlaps = this.findOverlaps();
    
            if (overlaps.length > 0) {
                overlaps.forEach(overlap => {
                    const { other, overlap: amount } = overlap;
                    const targetPosition = store.selection.getPosition();
                    const { y } = other.parent.getPosition();
                    targetPosition.y = y + amount.y * 0.5 + (Math.sign(amount.y) * 2);
                    me.setPosition(targetPosition);
                    me.resolveOverlaps();
                })
                draw.thoughtConnectors();
            }
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
    
        getConnectorStartAndEnd(isRootOnMyLeft) {
            const myCorners = this.getCorners();
            const parentCorners = this.parent.getCorners();
    
            return {
                me: isRootOnMyLeft ? myCorners.bottom.left : myCorners.bottom.right,
                parent: isRootOnMyLeft ? parentCorners.bottom.right : parentCorners.bottom.left,
            }
        }
    
        isParentOnLeft() {
            const { x } = this.getPosition();
            const { x: a } = this.parent.getPosition();
    
            return a < x;
        }
    
        updatePosition() {
            const element = this.element;
            const { x, y } = this.getPosition();
            const { width, height } = element.getOuterSize(true);
            const newX = (x - width) * store.scale;
            const newY = (y - height) * store.scale;
            element.setPosition(newX, newY);
        }
    
        setPosition(newPosition) {
            this.position.setV(newPosition);
            this.updatePosition();
        }
    
        addPosition(positionToAdd) {
            this.position.add(positionToAdd);
            this.updatePosition();
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
    
        saveCurrentSize() {
            const { width, height } = this.element.getSize();
            this.savedSize.set(width, height);
        }
    
        saveMousePositionDiff() {
            this.mousePositionDiff = this.getPosition().subtract(mouse.getPosition());
        }
    
        addChildThought() {
            const myPosition = this.getPosition();
            const newChild = new Thought(myPosition, this);
            const widthHalf = this.element.getOuterWidth() * 0.5;
            const childWidthHalf = newChild.element.getOuterWidth() * 0.5;
            newChild.addPosition(new Vector(widthHalf + childWidthHalf + store.defaultSpawnGap.horiz, 0));
            this.children.push(newChild);
            newChild.resolveOverlaps();
            // newChild.select();
            newChild.edit();
            draw.thoughtConnectors();
        }
    
        addSiblingThought() {
            const myPosition = this.getPosition();
            const newChild = new Thought(myPosition, this.parent);
            const heightHalf = this.element.getOuterHeight() * 0.5;
            const childHeightHalf = newChild.element.getOuterHeight() * 0.5;
            newChild.addPosition(new Vector(0, heightHalf + childHeightHalf + store.defaultSpawnGap.vert));
            this.parent.children.push(newChild);
            newChild.resolveOverlaps();
            // newChild.select();
            newChild.edit();
            draw.thoughtConnectors();
        }
    
        removeChildThought(childToBeRemoved) {
            this.children = this.children.filter(function(child) {
                return child.id !== childToBeRemoved.id;
            });
            draw.thoughtConnectors();
        }
    
        hasChildren() {
            return this.children.length > 0;
        }
    
        getChildren(withSubChildren = false) {
            if (withSubChildren) {
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
    
        removeSelf() {
            const me = this;
            this.children.forEach(function(child){
                child.removeSelf();
            });
            this.getElement().remove();
            store.thoughts = store.thoughts.filter(function(thought) {
                return thought.id !== me.id;
            })
            if (this.parent) this.parent.removeChildThought(me);
        }
    
        select() {
            if (store.selection && store.selection.id !== this.id) store.selection.unselect();
            this.getElement().className += ' selected';
            this.saveMousePositionDiff();
            this.saveCurrentSize();
            this.state = THOUGHT_STATE.SELECTED;
            store.selection = this;
        }
    
        unselect() {
            if (this.isEdited()) this.stopEditing();
            const element = this.getElement();
            element.className = element.className.replace(/\s*selected\s*/g, '');
            this.state = THOUGHT_STATE.IDLE;
            store.selection = undefined;
        }
    
        insertTextarea() {
            const me = this;
            const parent = this.element;
            const parentStyle = parent.getStyle();
            const element = parent.getElement();
            const textarea = document.createElement('textarea');
            textarea.id = this.id;
            textarea.className = 'thought-textarea';
            textarea.value = parent.getValue();
            textarea.style.width = `${parent.getWidth() || parentStyle.maxWidth}px`;
            textarea.style.height = `${parent.getHeight() || parentStyle.lineHeight}px`;
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
        }
    
        stopEditing() {
            const value = this.element.getValue();
            const element = this.getElement();
            element.innerHTML = value;
            element.style.height = '';
            this.updatePosition();
            draw.thoughtConnectors();
        }
    }

    window.Thought = Thought;

})();
