function Thought(pos, parent) {
    const me = this;

    me.id = ++state.lastUsedID;
    me.position = new Vector().copyFrom(pos);
    me.mousePositionDiff = new Vector();
    me.content = '';
    me.parent = parent || undefined;
    me.children = [];
    me.interactable = createInteractableTextarea(me);

    me.getBoundingRectangle = function() {
        const { width, height } = me.interactable.getOuterSize();
        const { x, y } = me.getPosition();

        return new Rectangle(
            x - (width * 0.5),
            y - (height * 0.5),
            width,
            height,
            me,
        )
    }

    me.isOverlappingOther = function(other) {
        const myBounds = me.getBoundingRectangle();
        const otherBounds = other.getBoundingRectangle();

        return myBounds.isOverlappingWith(otherBounds);
    }

    me.findOverlaps = function() {
        const overlaps = [];
        state.thoughts.forEach(thought => {
            if (thought.id !== me.id) {
                const result = me.isOverlappingOther(thought);
                if (result) {
                    overlaps.push(result);
                }
            }
        });

        return overlaps;
    }

    me.resolveOverlaps = function() {
        const overlaps = me.findOverlaps();

        if (overlaps.length > 0) {
            overlaps.forEach(overlap => {
                const { other, overlap: amount } = overlap;
                const newPosition = other.parent.getPosition();
                newPosition.y += amount.y + (Math.sign(amount.y) * 15);
                other.parent.setPosition(newPosition);
                canvas.redraw();
                other.parent.resolveOverlaps();
            })
        }
    }

    me.drawConnector = function(drawChildrenConnectors = false) {
        if (me.hasParent()) {
            const my = me.getPosition();
            const parent = me.parent.getPosition();
            Draw.bezierCurve(my, parent, my, parent);
        }
        if (drawChildrenConnectors && me.hasChildren()) {
            me.children.forEach(child => {
                child.drawConnector(true);
            });
        }
        // me.getBoundingRectangle().draw();
    }

    me.setPosition = function(newPosition) {
        me.position.copyFrom(newPosition);
        const { x, y } = newPosition;
        const { width, height } = me.interactable.getOuterSize(true);
        me.interactable.setAttribute('style', `left: ${x - width}px; top: ${y - height}px`);
    }

    me.getPosition = function() {
        return new Vector().copyFrom(me.position);;
    }

    me.saveMousePositionDiff = function() {
        me.mousePositionDiff = me.getPosition().subtract(mouse.getPosition());
    }

    me.addChildThought = function() {
        const { width } = me.interactable.getSize();
        let newPosition = me.getPosition();
        newPosition.x += width * 2;
        const newChild = new Thought(newPosition, me);
        me.children.push(newChild);
        newChild.resolveOverlaps();
    }

    me.removeChildThought = function(childToBeRemoved) {
        me.children = me.children.filter(function(child) {
            return child.id !== childToBeRemoved.id;
        });
        canvas.redraw();
    }

    me.hasChildren = function() {
        return me.children.length > 0;
    }

    function childrenReducer(acc, val) {
        const subChildren = val.getChildren(true);
        return acc.concat(val, subChildren)
    }

    me.getChildren = function(withSubChildren = false) {
        if (withSubChildren) {
            return me.children.reduce(childrenReducer, []);
        }

        return me.children;
    }

    me.hasParent = function() {
        return me.parent !== undefined;
    }

    me.updateContent = function(event) {        
        me.content = event.target.value;
    }

    me.removeSelf = function() {
        me.children.forEach(function(child){
            child.removeSelf();
        });
        me.interactable.remove();
        state.thoughts = state.thoughts.filter(function(thought) {
            return thought.id !== me.id;
        })
        if (me.parent) me.parent.removeChildThought(me);
    }

    me.getFocus = function() {
        setTimeout(() => {
            // me.interactable.click();
            me.interactable.focus();
        }, 0);
    }
    
    listen('input', me.updateContent, me.interactable);
    me.setPosition(pos);
    me.drawConnector();
    // me.getFocus();
    state.thoughts.push(me);
    return me;
}
