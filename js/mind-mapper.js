const { log } = console;
const listen = document.addEventListener;
const get = (query, element = document) => element.querySelector(query);
const ideas = [];
const body = document.body;
const textLengthArea = get('.text-length');
const canvas = get('#canvas');
const context = canvas.getContext('2d');
const textarea = 'textarea';
const svg = 'svg';
const SVG_NS = 'http://www.w3.org/2000/svg';
const classNames = {
    thought: 'thought',
    connector: 'connector',
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
    xPrev: 0,
    yPrev: 0,
    getPosition: function(e) {
        return {
            x: this.x,
            y: this.y,
        }
    },
    setPosition: function(pos) {
        this.x = pos.x;
        this.y = pos.y;
    },
    savePosition: function() {
        this.xPrev = this.x;
        this.yPrev = this.y;
    },
}

let selectedThought = undefined;

const innerWidth = body.width = canvas.width = window.innerWidth && document.documentElement.clientWidth
    ? Math.min( window.innerWidth, document.documentElement.clientWidth )
    : window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;

const innerHeight = body.height = canvas.height = window.innerHeight && document.documentElement.clientHeight
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
    mouse.savePosition();
    const x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    const y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    mouse.setPosition({ x, y });

    const { target } = event;
    const { tagName } = target;

    if (!mouse.isLeftButtonDown) {
        selectedThought = tagName === textarea.toUpperCase() ? target.thoughtRef : undefined;
    }
    else {
        if (selectedThought) {
            selectedThought.setPosition(mouse);
            // context.setTransform( 1, 0, 0, 1, 0, 0 );
            context.clearRect(0, 0, canvas.width, canvas.height);
            ideas.forEach(idea => {
                idea.drawConnector(true);
            })
        }
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

function addRemoveSelfToElement(element) {
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
}

const Draw = {
    bezierCurve: function(start, end, p1, p2, color) {
        context.beginPath();
        context.strokeStyle = color || 'rgb( 255, 0, 0 )';
        context.lineWidth = 4;
        context.moveTo(start.x, start.y);
        context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
        context.stroke();
    },
};

const Thought = function(pos, parent = undefined) {
    const me = this;
    me.x = pos.x;
    me.y = pos.y;
    me.content = '';
    me.children = [];
    me.parent = parent;

    me.addVisualRepresentation = function() {
        const element = document.createElement(textarea);
        element.className = classNames.thought;
        addRemoveSelfToElement(element);
        element.getOuterWidth = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            return element.offsetWidth || style.width;
        };
        element.getOuterHeight = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            return element.offsetHeight || style.height;
        };
        element.getWidth = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            const width = element.offsetWidth || style.width;
            const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
            const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

            return width - margin - padding - border;
        };
        element.getHeight = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            const height = element.offsetHeight || style.height;
            const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
            const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

            return height - margin - padding + border;
        };
        element.getSize = function(returnHalfValues = false) {
            const width = element.getWidth();
            const height = element.getHeight();

            return {
                width: returnHalfValues ? width * 0.5 : width,
                height: returnHalfValues ? height * 0.5 : height,
            }
        };
        element.getOuterSize = function(returnHalfValues = false) {
            const width = element.getOuterWidth();
            const height = element.getOuterHeight();

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
            const height = nuberOfLines * parseInt(window.getComputedStyle(element)['lineHeight']);
            element.style.height = height + 'px';
        };

        /* 0 timeout to get text after its value was changed */
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

    me.elementRef = me.addVisualRepresentation();

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
        };
    };

    me.setPosition = function(newPosition) {
        const { x, y } = newPosition;
        me.x = x;
        me.y = y;
        const { width, height } = me.elementRef.getOuterSize(true);
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
        x += width * 2;
        // y += height * 0.75;
        me.children.push(new Thought({ x, y }, me));
    };

    me.removeChildThought = function(childToBeRemoved) {
        me.children = me.children.filter(function(child) {
            return child.x + child.y !== childToBeRemoved.x + childToBeRemoved.y;
        });
    };

    me.hasChildren = function() {
        return me.children.length > 0;
    };

    me.hasParent = function() {
        return me.parent !== undefined;
    };

    me.updateContent = function(event) {        
        me.content = event.target.value;
    };

    me.removeSelf = function() {
        me.children.forEach(function(child){
            child.removeSelf();
        });
        me.elementRef.remove();
        me.connector.remove();
        if (me.parent) me.parent.removeChildThought(me);
    };
    
    me.elementRef.addEventListener('input', me.updateContent);
    me.setPosition(pos);
    me.elementRef.click();
    if (me.parent) me.drawConnector();
}

// add first top node
ideas.push(new Thought(getScreenCenterCoords()));

function getActiveElement() {
    return document.activeElement;
}

function deleteselectedThought() {
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
