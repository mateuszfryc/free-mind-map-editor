class Key {
    constructor(code, name) {
        this.code = code;
        this.name = name;
        this.isPressed = false;
    }

    setState(event) {
        this.isPressed = event.key === this.name || event.keyCode === this.code;
    }
}

const keysState = {
    enter:     new Key(13, 'Enter'),
    esc:       new Key(27, 'Escape'),
    leftShift: new Key(16, 'Shift'),
    tab:       new Key(9, 'Tab'),
    delete:    new Key(46, 'Delete'),
}

const actionKeys = {
    addChild: keysState.tab,
    addSibling: keysState.enter,
    deleteSelected: keysState.delete,
}

function onPressKey(event) {
    event = event || window.event;
    keysState.forEach(key => {
        key.setState(event);
    });

    if (keysState.enter.isPressed && store.selection || keysState.tab.isPressed) {
        event.preventDefault();
    }

    const { selection } = store;

    if (selection) {

        if (actionKeys.addChild.isPressed && !keysState.leftShift.isPressed) {
            selection.addChildThought();
            return;
        }
        else if (actionKeys.addSibling.isPressed && !keysState.leftShift.isPressed && selection.hasParent()) {
            selection.parent.addChildThought();
            return;
        }
        else if (actionKeys.deleteSelected.isPressed && !keysState.leftShift.isPressed) {
            selection.removeSelf();
            return;
        }
    }
} 

function onReleaseKey(event) {
    keysState.forEach(key => {
        key.setState(event);
    });
}

on("keydown", onPressKey);
on("keyup", onReleaseKey);

const mouse = {
    isLeftButtonDown: false,
    position: new Vector(),
    lastPosition: undefined,

    getPosition: function() {
        return this.position.getCopy();
    },

    setPosition: function(newPosition) {
        this.position.setV(newPosition)
    },

    storeCurrentPosition: function() {
        this.lastPosition = this.getPosition();
    },
}

function onMouseDown(event) {
    event = event || window.event;
    const { target } = event;
    const { highlight } = store;
    mouse.isLeftButtonDown = true;

    if (highlight) {
        highlight.select();

        if (target.thoughtRef && !target.thoughtRef.state === THOUGHT_STATE.SELECTED) target.thoughtRef.select();

        if (keysState.leftShift.isPressed) {
            highlight.getChildren(true).forEach(child => child.saveMousePositionDiff());
        }
    }
    else {
        if (store.selection && target.id && parseInt(target.id) !== store.selection.id) {
            store.selection.unselect();
        }
    }
}

function onMouseUp() {
    mouse.isLeftButtonDown = false;
}

function onMouseMove(event) {
    event = event || window.event;
    mouse.storeCurrentPosition();
    const x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    const y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    mouse.setPosition({ x, y });
    const { target } = event;
    const { className } = target;

    if (!mouse.isLeftButtonDown) {
        store.highlight = className.includes('thought') ? target.thoughtRef : undefined;
    }
    else {
        if (store.highlight) {
            // drag thought (node)
            if (store.highlight.savedSize && store.highlight.savedSize.equals(store.highlight.getSize())) {
                store.highlight.setPosition(mouse.getPosition().add(store.highlight.mousePositionDiff));

                // if shift is pressed also drag children
                if (keysState.leftShift.isPressed) {
                    store.highlight.getChildren(true).forEach(child => {
                        child.setPosition(mouse.getPosition().add(child.mousePositionDiff));
                    })
                }
            }
            
        }
        else {
            // drag view / pan camera by holding mouse left button on background
            const mouseDiff = mouse.getPosition().subtract(mouse.lastPosition.getCopy());
            canvas.offset.setV(mouseDiff);
            store.ideas.forEach(idea => {
                idea.addPosition(mouseDiff);
                idea.getChildren(true).forEach(child => child.addPosition(mouseDiff));
            })
        }
        canvas.redraw();
    }
}

function onMouseScroll( event ) {
    // zoom in / out on wheel if mouse is over canvas
    if( !event.wheelDelta && !event.deltaY ) {
        if( event === '+' ) store.scale += store.scaleStep
        else if( e === '-' ) store.scale -= store.scaleStep;
    }
    else {
        if( event.wheelDelta ) {
            store.scale = event.wheelDelta > 0 ? store.scale + store.scaleStep : store.scale - store.scaleStep;
        }
        else if( event.deltaY ) {
            store.scale = event.deltaY < 0 ? store.scale + store.scaleStep : store.scale - store.scaleStep;
        }
    }
  
    // When zooming in or out update canvas offset and push it's center little bit closer
    // to where the mouse pointer currenlty is.
    // Below factor divides distance from center of vieport to mouse pointer
    // allowing for more smooth transition:
    let f = 5;
  
    if( mouse.x < canvas.width / 2) canvas.offset.x += ( canvas.width / 2 - mouse.x ) / f
    else canvas.offset.x -= ( mouse.x - canvas.width / 2 ) / f;
  
    if( mouse.y < canvas.height / 2) canvas.offset.y += ( canvas.height / 2 - mouse.y ) / f
    else canvas.offset.y -= ( mouse.y - canvas.height / 2 ) / f;

    store.thoughts.forEach(thought => thought.updateVisuals());
    canvas.redraw();
};

on('mousemove', onMouseMove);
on('mouseup', onMouseUp);
on('mousedown', onMouseDown);

canvas.on('wheel', onMouseScroll);

function isKeyBindToAction(keyCode) {
    return Object.entries(actionKeys).map(code => code[1]).includes(keyCode);
}
