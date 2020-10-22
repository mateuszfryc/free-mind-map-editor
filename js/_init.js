const { log } = console;
const listen = document.addEventListener
const body = document.body;
const textarea = 'textarea';
const thought = 'thought';
let selectedThought = undefined;
const keysCodes = {
    tab: 9,
    delete: 46,
};
const mouse = {
    isLeftButtonDown: false,
    x: 0,
    y: 0,
    getPosition: function(e) {
    return {
        x: e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        y: e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    }
    },
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    }
}

body.width = window.innerWidth && document.documentElement.clientWidth
    ? Math.min( window.innerWidth, document.documentElement.clientWidth )
    : window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;

body.height = window.innerHeight && document.documentElement.clientHeight
    ? Math.min(window.innerHeight, document.documentElement.clientHeight)
    : window.innerHeight
        || document.documentElement.clientHeight
        || document.getElementsByTagName('body')[0].clientHeight;

function onMouseDown(event) {
    mouse.isLeftButtonDown = true;
}

function onMouseUp(event) {
    mouse.isLeftButtonDown = false;
}

function onMouseMove(event) {
    event = event || window.event;  
    const { x, y } = mouse.getPosition(event);  
    mouse.setPosition(x, y);

    const { target } = event;
    const { tagName } = target;

    if (tagName === textarea.toUpperCase()) {
        selectedThought = target;
    }
}

listen('mousemove', onMouseMove);
listen('mouseup' , onMouseUp);
listen('mousedown', onMouseDown);

function getScreenCenterCoords() {
    return {
        x: document.body.width * 0.5,
        y: document.body.height * 0.5,
    }
}

function getElementSize(element, shouldReturnHalfValues = false) {
    const { clientWidth, clientHeight } = element;
    return {
        width: shouldReturnHalfValues ? clientWidth * 0.5 : clientWidth,
        height: shouldReturnHalfValues ? clientHeight * 0.5 : clientHeight,
    }
}

function addNode(position, shouldFocusNewElement = true) {
    const element = document.createElement(textarea);
    element.className = thought;
    const { x, y } = position;
    document.body.appendChild(element);
    const { width, height } = getElementSize(element);
    element.setAttribute('style', `left: ${x - (element.clientWidth * 0.5)}px; top: ${y - (element.clientHeight * 0.5)}px`);
    if (shouldFocusNewElement) {
        element.focus();
    };
    if (!element.hasOwnProperty('remove')) {
        Object.defineProperty(element, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
              this.parentNode.removeChild(this);
            }
        });
    }
};

addNode(getScreenCenterCoords());

function getActiveElement() {
    return document.activeElement;
}

function getElementPosition(element) {
    const { left, top } = element.style;
    return {
        x: parseInt(left, 10),
        y: parseInt(top, 10),
    }
}

function addChildThought() {
    const activeElement = getActiveElement();
    const { width, height } = getElementSize(activeElement);
    const position = getElementPosition(activeElement);
    position.x += (width * 2);
    position.y += (height * 0.5);
    addNode(position);
}

function deleteSelectedThought() {
    getActiveElement().remove();
}

function onKeyDown(event) {
    const { keyCode, target } = event;
    if (target.className.includes(thought)) {
        switch(keyCode) {
            case keysCodes.tab:
                addChildThought();
                return;
            case keysCodes.delete:
                deleteSelectedThought();
            default:
                return;
        }
    }
};

listen('keydown', onKeyDown);
