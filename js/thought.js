class Thought {
    constructor(position, parent) {
        this.id = ++store.lastUsedID;
        this.element = new ThoughtVisual(this);
        this.position = new Vector();
        this.mousePositionDiff = new Vector();
        this.savedSize = new Vector();
        this.content = '';
        this.parent = parent || undefined;
        this.children = [];
        this.state = THOUGHT_STATE.IDLE;
        
        this.setPosition(position);
        this.drawConnector();
        store.thoughts.push(this);
    }

    getElement() {
        return this.element.getElement();
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
        const overlaps = this.findOverlaps();

        if (overlaps.length > 0) {
            overlaps.forEach(overlap => {
                const { other, overlap: amount } = overlap;
                const newPosition = other.parent.getPosition();
                newPosition.y += amount.y * 0.5 + (Math.sign(amount.y) * 2);
                other.parent.setPosition(newPosition);
                other.parent.resolveOverlaps();
            })
            canvas.redraw();
        }
    }

    drawConnector(drawChildrenConnectors = false) {
        if (this.hasParent()) {
            const my = this.getPosition();
            const parent = this.parent.getPosition();
            Draw.bezierCurve(my, parent, my, parent);
        }
        if (drawChildrenConnectors && this.hasChildren()) {
            this.children.forEach(child => {
                child.drawConnector(true);
            });
        }
        // me.getBoundingRectangle().draw();
    }

    updatePosition() {
        const element = this.element;
        const { x, y } = this.getPosition();
        const { width, height } = element.getOuterSize(true);
        const newX = (x - width) * store.scale;
        const newY = (y - height) * store.scale;
        element.setPosition(newX, newY);
    }

    updateVisuals() {
        this.getElement().updateScale();
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
        const { width } = this.element.getSize();
        let newPosition = this.getPosition();
        newPosition.x += width * 2;
        const newChild = new Thought(newPosition, this);
        this.children.push(newChild);
        newChild.resolveOverlaps();
        newChild.edit();
    }

    removeChildThought(childToBeRemoved) {
        this.children = this.children.filter(function(child) {
            return child.id !== childToBeRemoved.id;
        });
        canvas.redraw();
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
        if (store.selection) store.selection.unselect();
        this.getElement().className += ' selected';
        this.saveMousePositionDiff();
        this.saveCurrentSize();
        this.state = THOUGHT_STATE.SELECTED;
        store.selection = this;
    }

    unselect() {
        this.stopEditing();
        const element = this.getElement();
        element.className = element.className.replace(/\s*selected\s*/g, '');
        this.state = THOUGHT_STATE.IDLE;
        store.selection = undefined;
    }

    edit() {
        if (this.state === THOUGHT_STATE.IDLE) this.select();
        const element = this.getElement();
        const value = element.innerHTML;
        const textarea = document.createElement('textarea');
        textarea.id = this.id;
        textarea.className = 'thought-textarea';
        textarea.value = value;
        element.innerHTML = '';
        element.appendChild(textarea);
        this.state = THOUGHT_STATE.EDITED;
        textarea.focus();
    }

    stopEditing() {
        const element = this.getElement();
        const innerTextarea = get('textarea', element);
        if (innerTextarea) {
            const value = innerTextarea.value;
            element.innerHTML = value;
        }
    }
}
