// shift + tab : focus back to parent

const keysCodes = {
    tab: 9,
    delete: 46,
    esc: 27,
    enter: 13,
    leftShift: 16,
}
const actionKeys = {
    addChild: keysCodes.tab,
    addSibling: keysCodes.enter,
    deleteSelected: keysCodes.esc,
}

function evaluateKyes(event) {
    const { target } = event;
    const selected = getSelectedThought();

    if (target.className.includes('thought') && target.thoughtRef) {

        if (actionKeys.addChild in state.keysDown && !(keysCodes.leftShift in state.keysDown)) {
            selected.addChildThought();
            return;
        }

        if (actionKeys.addSibling in state.keysDown && !(keysCodes.leftShift in state.keysDown)) {
            selected.parent.addChildThought();
            return;
        }

        if (actionKeys.deleteSelected in state.keysDown && !(keysCodes.leftShift in state.keysDown)) {
            selected.removeSelf();
            return;
        }
    }
}

function pressKey(event) {
    state.keysDown[event.keyCode] = true;
    evaluateKyes(event);
} 

function releaseKey(event) {
    delete state.keysDown[event.keyCode];
}

listen("keydown", pressKey);
listen("keyup", releaseKey);

const mouse = {
    isLeftButtonDown: false,
    position: new Vector(),

    getPosition: function() {
        return new Vector().copyFrom(this.position);
    },

    setPosition: function(newPosition) {
        this.position.copyFrom(newPosition)
    },
}

function onMouseDown() {
    mouse.isLeftButtonDown = true;

    if (state.highlight) {
        state.highlight.saveMousePositionDiff();
        if (keysCodes.leftShift in state.keysDown) {
            state.highlight.getChildren(true).forEach(child => child.saveMousePositionDiff());
        }
    }
}

function onMouseUp() {
    mouse.isLeftButtonDown = false;
}

function onMouseMove(event) {
    event = event || window.event;  
    const x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    const y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    mouse.setPosition({ x, y });

    const { target } = event;
    const { tagName } = target;

    if (!mouse.isLeftButtonDown) {
        state.highlight = tagName === 'TEXTAREA' ? target.thoughtRef : undefined;
    }
    else {
        if (state.highlight) {
            state.highlight.setPosition(mouse.getPosition().add(state.highlight.mousePositionDiff));

            if (keysCodes.leftShift in state.keysDown) {
                state.highlight.getChildren(true).forEach(child => {
                    child.setPosition(mouse.getPosition().add(child.mousePositionDiff));
                })
            }

            canvas.redraw();
        }
    }
}

listen('mousemove', onMouseMove);
listen('mouseup' , onMouseUp);
listen('mousedown', onMouseDown);

function getSelectedThought() {
    return document.activeElement.thoughtRef;
}

function isKeyBindToAction(keyCode) {
    return Object.entries(actionKeys).map(code => code[1]).includes(keyCode);
}
