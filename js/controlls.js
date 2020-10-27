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

const ENTER = 'Enter';
const ESCAPE = 'Escape';
const SHIFT = 'Shift';
const TAB = 'Tab';
const DELETE = 'Delete';
const SPACE = ' ';

const KEYS = {
    [ ENTER  ]: new Key( 13, ENTER  ),
    [ ESCAPE ]: new Key( 27, ESCAPE ),
    [ SHIFT  ]: new Key( 16, SHIFT  ),
    [ TAB    ]: new Key( 9,  TAB    ),
    [ DELETE ]: new Key( 46, DELETE ),
    [ SPACE  ]: new Key( 32, SPACE  ),
}

const actionKeys = {
    addChild: KEYS[TAB],
    addSibling: KEYS[ENTER],
    deleteSelected: KEYS[DELETE],
    exitEditState: KEYS[ESCAPE]
}

function onPressKey(event) {
    const { key, keyCode, shiftKey } = event;

    if (key) {
        if (KEYS[key]) {
            KEYS[key].isPressed = true;
        }
    }
    else if (keyCode) {
        Object.values(KEYS).find(key => key.code === keyCode).isPressed = false;
    }

    KEYS[SHIFT].isPressed = shiftKey;

    if (KEYS[ENTER].isPressed && store.selection || KEYS[TAB].isPressed) {
        event.preventDefault();
    }

    const { selection } = store;
    
    if (selection) {
        const hasParent = selection.hasParent()

        if (KEYS[SHIFT].isPressed) {
            if (KEYS[TAB].isPressed && hasParent) {
                selection.parent.select();
            }
        }
        else {
            if (actionKeys.addChild.isPressed) {
                selection.addChildThought();
                return;
            }
            else if (actionKeys.addSibling.isPressed && hasParent) {
                selection.addSiblingThought();
                return;
            }
            else if (actionKeys.exitEditState.isPressed && selection.state === THOUGHT_STATE.EDITED) {
                selection.stopEditing();
            }
            else if (actionKeys.deleteSelected.isPressed && selection.state !== THOUGHT_STATE.EDITED) {
                selection.removeSelf();
                return;
            }
        }
    }
} 

function onReleaseKey(event) {
    const { key, keyCode, shiftKey } = event;

    if (key) {
        if (KEYS[key]) {
            KEYS[key].isPressed = false;
        }
    }
    else if (keyCode) {
        Object.values(KEYS).find(key => key.code === keyCode).isPressed = false;
    }

    KEYS[SHIFT].isPressed = shiftKey;
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
    const { target } = event;
    const { highlight } = store;
    mouse.isLeftButtonDown = true;

    if (highlight) {
        if (highlight.state === THOUGHT_STATE.IDLE) highlight.select();

        if (target.thoughtRef && !target.thoughtRef.state === THOUGHT_STATE.SELECTED) target.thoughtRef.select();

        if (KEYS[SHIFT].isPressed) {
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
    mouse.storeCurrentPosition();
    const x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    const y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    mouse.setPosition({ x, y });
    const { target } = event;
    const { className } = target;

    if (!mouse.isLeftButtonDown) {
        store.highlight = className.includes('thought') ? target.getThought() : undefined;
    }
    else {
        if (store.highlight) {
            if (store.highlight.state === THOUGHT_STATE.EDITED) return;
            // drag thought (node)
            if (store.highlight.savedSize && store.highlight.savedSize.equals(store.highlight.getSize())) {
                store.highlight.setPosition(mouse.getPosition().add(store.highlight.mousePositionDiff));

                // if Shift is pressed also drag children
                if (KEYS[SHIFT].isPressed) {
                    store.highlight.getChildren(true).forEach(child => {
                        child.setPosition(mouse.getPosition().add(child.mousePositionDiff));
                    })
                }
            }
            canvas.redraw();
            return;
            
        }
        // drag view / pan camera by holding mouse left button on background
        const mouseDiff = mouse.getPosition().subtract(mouse.lastPosition.getCopy());
        canvas.offset.setV(mouseDiff);
        store.ideas.forEach(idea => {
            idea.addPosition(mouseDiff);
            idea.getChildren(true).forEach(child => child.addPosition(mouseDiff));
        })
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

function isKeyBindToAction(event) {
    return Object.values(actionKeys).some(key => key.name === event.key || key.code === event.keyCode);
}
