const { log } = console;
const listen = document.addEventListener;
const get = (query, element = document) => element.querySelector(query);
const ideas = [];
const body = document.body;
const textLengthArea = get('.text-length');
const textarea = 'textarea';
const classNames = {
    thought: 'thought',
}
const keysCodes = {
    tab: 9,
    delete: 46,
    esc: 27,
}
const actionKeys = {
    addChild: keysCodes.tab,
    deleteSelected: keysCodes.esc,
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

let selectedThought = undefined;

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

function isKeyBindToAction(keyCode) {
    return Object.entries(actionKeys).map(code => code[1]).includes(keyCode);
}

function getScreenCenterCoords() {
    return {
        x: document.body.width * 0.5,
        y: document.body.height * 0.5,
    }
}

const Thought = function(pos, parent = undefined) {
    const me = this;
    me.x = pos.x;
    me.y = pos.y;
    me.content = '';
    me.children = [];
    me.parentRef = parent;

    me.createElement = function() {
        const element = document.createElement(textarea);
        element.className = classNames.thought;
        if (!element.hasOwnProperty('remove')) {
            Object.defineProperty(element, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                this.parentNode.removeChild(this);
                }
            });
        };
        element.getWidth = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            const width = element.offsetWidth || style.width;
            const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
            const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

            return width + margin - padding - border;
        };
        element.getHeight = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            const height = element.offsetHeight || style.height;
            const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
            const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

            return height + margin - padding + border;
        };
        element.getSize = function(returnHalfValues = false) {
            const width = element.getWidth();
            const height = element.getHeight();

            return {
                width: returnHalfValues ? width * 0.5 : width,
                height: returnHalfValues ? height * 0.5 : height,
            }
        };
        element.getPosition = function() {
            const { left, top } = element.style;
            return {
                x: parseInt(left, 10),
                y: parseInt(top, 10),
            };
        };

        element.setAttribute('rows', 1);
        element.setAttribute('cols', 10);

        function resize() {
            textLengthArea.innerHTML = element.value;
            const textLength = textLengthArea.clientWidth;
            const width = element.getWidth();
            if (element.value === '' && textLength < width) {
                return;
            };
            const nuberOfLines = Math.ceil(textLength / width);
            log(textLength, width, nuberOfLines);
            const height = nuberOfLines * parseInt(window.getComputedStyle(element)['lineHeight']);
            element.style.height = height + 'px';
        };

        /* 0-timeout to get the already changed text */
        function delayedResize () {
            window.setTimeout(resize, 0);
        }

        function observe(event, handler) {
            element.addEventListener(event, handler, false);
        };

        observe('change',  resize);
        ['cut', 'paste', 'drop'].forEach(function(event) {
            observe(event, delayedResize);
        });
        observe('keydown', function(event) {
            const { keyCode } = event;
            if (isKeyBindToAction(keyCode)) {
                return;
            }
            delayedResize();
        });

        document.body.appendChild(element);
        element.thoughtRef = me;
        return element;
    };

    me.elementRef = me.createElement();

    me.setPosition = function(newPosition) {
        const { x, y } = newPosition;
        me.x = x;
        me.y = y;
        const { width, height } = me.elementRef.getSize(true);
        me.elementRef.setAttribute('style', `left: ${x - width}px; top: ${y - height}px`);
    };

    me.getPosition = function() {
        return {
            x: me.x,
            y: me.y,
        }
    };

    me.addChildThought = function() {
        const { width, height } = me.elementRef.getSize();
        let { x, y } = me.getPosition();
        x += width * 1.5;
        // y += height * 0.75;
        me.children.push(new Thought({ x, y }, me));
    };

    me.removeChildThought = function(childToBeRemoved) {
        me.children = me.children.filter(function(child) {
            return child.x + child.y !== childToBeRemoved.x + childToBeRemoved.y;
        });
    };

    me.updateContent = function(event) {        
        me.content = event.target.value;
    };

    me.removeSelf = function() {
        me.children.forEach(function(child){
            child.removeSelf();
        });
        me.elementRef.remove();
        if (me.parentRef) me.parentRef.removeChildThought(me);
    };
    
    me.elementRef.addEventListener('input', me.updateContent);
    me.setPosition(pos);
    // me.elementRef.focus();
    me.elementRef.click();
}

// add first top node
ideas.push(new Thought(getScreenCenterCoords()));

function getActiveElement() {
    return document.activeElement;
}

function deleteSelectedThought() {
    getActiveElement().remove();
}

function onKeyDown(event) {
    const { keyCode, target } = event;
    const { thoughtRef } = getActiveElement();
    if (target.className.includes(classNames.thought) && target.thoughtRef) {
        switch(keyCode) {
            case actionKeys.addChild:
                thoughtRef.addChildThought();
                return;
            case actionKeys.deleteSelected:
                thoughtRef.removeSelf();
            default:
                return;
        }
    }
};

listen('keydown', onKeyDown);
