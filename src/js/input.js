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

const ENTER  = 'Enter';
const ESCAPE = 'Escape';
const SHIFT  = 'Shift';
const TAB    = 'Tab';
const DELETE = 'Delete';
const SPACE  = ' ';

const KEYS = {
    [ ENTER  ]: new Key( 13, ENTER  ),
    [ ESCAPE ]: new Key( 27, ESCAPE ),
    [ SHIFT  ]: new Key( 16, SHIFT  ),
    [ TAB    ]: new Key( 9,  TAB    ),
    [ DELETE ]: new Key( 46, DELETE ),
    [ SPACE  ]: new Key( 32, SPACE  ),
}

const actionKeys = {
    addChild:       KEYS[ TAB    ],
    addSibling:     KEYS[ ENTER  ],
    deleteSelected: KEYS[ DELETE ],
    edit:           KEYS[ SPACE  ],
    exitEditState:  KEYS[ ESCAPE ],
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
    store.isGroupDraggOn = !KEYS[SHIFT].isPressed;

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
                selection.createChildThought().resolveOverlaps().edit();
                draw.connectors();
            }
            else if (actionKeys.addSibling.isPressed && hasParent) {
                selection.createSiblingThought().resolveOverlaps().edit();
                draw.connectors();
            }
            else if (selection.isEdited()) {
                if (actionKeys.exitEditState.isPressed) {
                    const hasContent = selection.stopEditing();
                    if (!hasContent) {
                        store.highlight = undefined;
                        store.selection = undefined;
                    }
                }
            }
            else {
                if (actionKeys.deleteSelected.isPressed) {
                    selection.removeSelf();
                }
                else if (actionKeys.edit.isPressed) {
                    selection.edit();
                }
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
    store.isGroupDraggOn = !KEYS[SHIFT].isPressed;
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

    if (highlight && highlight.id === target.thoughtRef.id) {
        highlight.saveChildrenRelativePosition();
        highlight.saveMousePositionDiff();

        if (highlight.isIdle() || !highlight.isSelected()) {
            highlight.select();
        };

        highlight.getChildren(true).forEach(child => child.saveMousePositionDiff());
    }
    else {
        if (store.selection && target.id && parseInt(target.id) !== store.selection.id) {
            store.selection.unselect();
        }
    }
}

function onMouseUp() {
    mouse.isLeftButtonDown = false;

    if (store.highlight && store.highlight.isBeingDragged()) {
        const { closestOverlap, parent } = store.highlight;
        if (closestOverlap && !store.highlight.isParentOf(closestOverlap, true) && !closestOverlap.isChildOf(store.highlight)) {
            if (parent) parent.removeChildThought(store.highlight);
            closestOverlap.addChildThought(store.highlight);
            store.highlight.resolveOverlaps('x').restoreChildrenRelativePosition();
            store.highlight.getChildren(true).forEach(child => child.resolveOverlaps());
        }
        
        store.highlight.element.resetZIndex();
        store.highlight.stopDragging();
    }
    draw.connectors();
}   

function onMouseDbClick() {
    if (store.highlight) {
        store.highlight.edit();
    }
}

function onMouseMove(event) {
    mouse.storeCurrentPosition();
    const x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    const y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    mouse.setPosition({ x, y });
    const { target } = event;
    const { className } = target;

    // log(mouse.position.x, mouse.position.y);

    if (!mouse.isLeftButtonDown) {
        store.highlight = className.includes('thought') ? target.getThought() : undefined;
    }
    else {
        if (store.highlight) {
            if (store.highlight.isEdited()) return;
            // drag thought (node)
            if (store.highlight.savedSize && store.highlight.savedSize.equals(store.highlight.getSize())) {
                store.highlight.dragg();
                store.highlight.element.setOnTop();
                store.highlight.setPosition(mouse.getPosition().addV(store.highlight.mousePositionDiff));
                
                // check for overlaps and if one exist note it
                store.highlight.closestOverlap = store.highlight.findClosestOverlap();

                if (store.isGroupDraggOn && store.highlight.getParentThought()) {
                    const isParentOnLeft = store.highlight.isParentOnLeft();
                    store.highlight.getChildren(true).forEach(draggable => {
                        if (
                            draggable.prevIsParentOnLeft !== undefined
                            && isParentOnLeft !== store.highlight.prevIsParentOnLeft
                        ) {
                            const hasChildren = draggable.hasChildren();
                            
                            const draggablePosition = draggable.getPosition();
                            const draggableParent = draggable.getParentThought();
                            let draggableParentPosition;
                            if (draggableParent) {
                                draggableParentPosition = draggableParent.getPosition();
                                if (hasChildren) draggable.saveChildrenRelativePosition();
                                const xDiff = (draggablePosition.x - draggableParentPosition.x) * 2;
                                draggablePosition.x -= xDiff;
                                draggable.setPosition(draggablePosition);
                                if (hasChildren) draggable.restoreChildrenRelativePosition();
                            }
                        }
                        
                        draggable.setPosition(mouse.getPosition().addV(draggable.mousePositionDiff));
                    });
                    store.highlight.prevIsParentOnLeft = isParentOnLeft;
                }
            }
            draw.connectors();

            return;
        }
        // drag view / pan camera by holding mouse left button on background
        const mouseDiff = mouse.getPosition().subtract(mouse.lastPosition.getCopy());
        draw.cameraOffset.setV(mouseDiff);
        store.thoughts.forEach(thought => {
            thought.addPosition(mouseDiff);
        })
        draw.connectors();
    }
}

// function onMouseScroll( event ) {
//     // zoom in / out on wheel if mouse is over canvas
//     if( !event.wheelDelta && !event.deltaY ) {
//         if( event === '+' ) store.scale += store.scaleStep
//         else if( e === '-' ) store.scale -= store.scaleStep;
//     }
//     else {
//         if( event.wheelDelta ) {
//             store.scale = event.wheelDelta > 0 ? store.scale + store.scaleStep : store.scale - store.scaleStep;
//         }
//         else if( event.deltaY ) {
//             store.scale = event.deltaY < 0 ? store.scale + store.scaleStep : store.scale - store.scaleStep;
//         }
//     }
  
//     // When zooming in or out update canvas offset and push it's center little bit closer
//     // to where the mouse pointer currenlty is.
//     // Below factor divides distance from center of vieport to mouse pointer
//     // allowing for more smooth transition:
//     let f = 5;
  
//     if( mouse.x < draw.canvas.width / 2) draw.cameraOffset.x += ( draw.canvas.width / 2 - mouse.x ) / f
//     else draw.cameraOffset.x -= ( mouse.x - canvas.width / 2 ) / f;
  
//     if( mouse.y < draw.canvas.height / 2) draw.cameraOffset.y += ( draw.canvas.height / 2 - mouse.y ) / f
//     else draw.cameraOffset.y -= ( mouse.y - draw.canvas.height / 2 ) / f;

//     store.thoughts.forEach(thought => thought.updateVisuals());
//     draw.connectors();
// };

on('mousemove', onMouseMove);
on('mouseup', onMouseUp);
on('mousedown', onMouseDown);
on('dblclick', onMouseDbClick);
// draw.canvas.on('wheel', onMouseScroll);

function isKeyBindToAction(event) {
    return Object.values(actionKeys).some(key => key.name === event.key || key.code === event.keyCode);
}
