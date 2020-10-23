const { log } = console;
const listen = (event, handler, element = document) => element.addEventListener(event, handler);
const get = (query, element = document) => element.querySelector(query);
const ideas = [];
let thoughts = [];
const body = document.body;
const textLengthArea = get('.text-length');
const canvas = get('#canvas');
const context = canvas.getContext('2d');
const textarea = 'textarea';
const classNames = {
    thought: 'thought',
}
// shift + tab : focus parent
// shift + mouse drag : drag with children
const keysCodes = {
    tab: 9,
    delete: 46,
    esc: 27,
    enter: 13,
}
const actionKeys = {
    addChild: keysCodes.tab,
    addSibling: keysCodes.enter,
    deleteSelected: keysCodes.esc,
}
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

let highlightedThought = undefined;
let lastUsedID = -1;

function updateInnerSize() {
    body.width = canvas.width = window.innerWidth && document.documentElement.clientWidth
        ? Math.min( window.innerWidth, document.documentElement.clientWidth )
        : window.innerWidth
            || document.documentElement.clientWidth
            || document.getElementsByTagName('body')[0].clientWidth;
    
    body.height = canvas.height = window.innerHeight && document.documentElement.clientHeight
        ? Math.min(window.innerHeight, document.documentElement.clientHeight)
        : window.innerHeight
            || document.documentElement.clientHeight
            || document.getElementsByTagName('body')[0].clientHeight;
}
updateInnerSize();
listen('resize', updateInnerSize, window);

canvas.redraw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    ideas.forEach(idea => {
        idea.drawConnector(true, true);
    })
}

function onMouseDown() {
    mouse.isLeftButtonDown = true;
}

function onMouseUp() {
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
        highlightedThought = tagName === textarea.toUpperCase() ? target.thoughtRef : undefined;
    }
    else {
        if (highlightedThought) {
            highlightedThought.setPosition(mouse);
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
    }
}

const Draw = {
    bezierCurve: function(start, end, p1, p2, color = 'rgb( 255, 0, 0 )') {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 4;
        context.moveTo(start.x, start.y);
        context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
        context.stroke();
    },
    rectangle: function(rectangle) {
        const { x, y, width, height } = rectangle;
        context.strokeStyle = 'red';
        context.fillStyle = 'transparent';
        context.lineWidth = 1;
        context.strokeRect( x, y, width, height )
    },
}

const Rectangle = function(x, y, width, height, parent) {
    const me = this;
    
    me.x = x;
    me.y = y;
    me.width = width;
    me.height = height;
    me.parent = parent;

    me.isOverlappingWith = function(other) {
        const isColliding = me.x + me.width >= other.x &&
                            me.y + me.height >= other.y &&
                            me.y <= other.y + other.height &&
                            me.x <= other.x + other.width;

        if (isColliding) {
            return { me, other, overlap: {
                x: me.x - other.x,
                y: me.y - other.y || me.height,
            }}
        }

        return false;
    }

    me.draw = function() {
        Draw.rectangle(me);
    }
}

const Thought = function(pos, parent = undefined) {
    const me = this;

    me.id = ++lastUsedID;
    me.x = pos.x;
    me.y = pos.y;
    me.content = '';
    me.children = [];
    me.parent = parent;
    me.elementRef = undefined;

    me.addVisualRepresentation = function() {
        const element = document.createElement(textarea);
        element.className = classNames.thought;
        addRemoveSelfToElement(element);
        element.getOuterWidth = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            return element.offsetWidth || style.width;
        }
        element.getOuterHeight = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            return element.offsetHeight || style.height;
        }
        element.getWidth = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            const width = element.offsetWidth || style.width;
            const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
            const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

            return width - margin - padding - border;
        }
        element.getHeight = function() {
            const style = element.currentStyle || window.getComputedStyle(element);
            const height = element.offsetHeight || style.height;
            const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
            const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

            return height - margin - padding + border;
        }
        element.getSize = function(returnHalfValues = false) {
            const width = element.getWidth();
            const height = element.getHeight();

            return {
                width: returnHalfValues ? width * 0.5 : width,
                height: returnHalfValues ? height * 0.5 : height,
            }
        }
        element.getOuterSize = function(returnHalfValues = false) {
            const width = element.getOuterWidth();
            const height = element.getOuterHeight();

            return {
                width: returnHalfValues ? width * 0.5 : width,
                height: returnHalfValues ? height * 0.5 : height,
            }
        }
        element.getPosition = function() {
            const { left, top } = element.style;
            return {
                x: parseInt(left, 10),
                y: parseInt(top, 10),
            }
        }

        element.setAttribute('rows', 1);
        element.setAttribute('cols', 10);

        element.getLineHeight = function() {
            return parseInt(window.getComputedStyle(element)['lineHeight']);
        }

        element.setHeight = function(height) {
            element.style.height = height + 'px';
        }

        function resize() {
            textLengthArea.innerHTML = element.value;
            const textLength = textLengthArea.clientWidth;
            const width = element.getWidth();
            const lineHeight = element.getLineHeight();
            if (element.value === '' || textLength < width) {
                element.setHeight(lineHeight);
                return;
            }
            const nuberOfLines = Math.ceil(textLength / width);
            const height = nuberOfLines * lineHeight;
            element.setHeight(height);
        }

        /* 0 timeout to get text after its value was changed */
        function delayedResize () {
            window.setTimeout(resize, 0);
        }

        function observe(event, handler) {
            listen(event, handler, element);
        }

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
        me.elementRef = element;

        return element;
    }

    me.elementRef = me.addVisualRepresentation();

    me.getBoundingRectangle = function() {
        const { width, height } = me.elementRef.getOuterSize();

        return new Rectangle(
            me.x - (width * 0.5),
            me.y - (height * 0.5),
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
        thoughts.forEach(thought => {
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
        const { x, y } = newPosition;
        me.x = x;
        me.y = y;
        const { width, height } = me.elementRef.getOuterSize(true);
        me.elementRef.setAttribute('style', `left: ${x - width}px; top: ${y - height}px`);
    }

    me.getPosition = function() {
        return {
            x: me.x,
            y: me.y,
        }
    }

    me.addChildThought = function() {
        const { width, height } = me.elementRef.getSize();
        let newPosition = me.getPosition();
        newPosition.x += width * 2;
        // newPosition.y += height * 0.75;
        const newChild = new Thought(newPosition, me);
        me.children.push(newChild);
        newChild.resolveOverlaps();
    }

    me.removeChildThought = function(childToBeRemoved) {
        me.children = me.children.filter(function(child) {
            return child.x + child.y !== childToBeRemoved.x + childToBeRemoved.y;
        });
        canvas.redraw();
    }

    me.hasChildren = function() {
        return me.children.length > 0;
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
        me.elementRef.remove();
        thoughts = thoughts.filter(function(thought) {
            return thought.id !== me.id;
        })
        if (me.parent) me.parent.removeChildThought(me);
    }

    me.getFocus = function() {
        setTimeout(() => {
            me.elementRef.click();
        }, 10);
    }
    
    listen('input', me.updateContent, me.elementRef);
    me.setPosition(pos);
    me.drawConnector();
    me.getFocus();
    thoughts.push(me);
    return me;
}

// add first top node
ideas.push(new Thought(getScreenCenterCoords()));

function onKeyDown(event) {
    const { keyCode, target } = event;
    const selected = getSelectedThought();

    if (target.className.includes(classNames.thought) && target.thoughtRef) {
        switch(keyCode) {
            case actionKeys.addChild:
                selected.addChildThought();
                return;

            case actionKeys.addSibling:
                selected.parent.addChildThought();
                return;

            case actionKeys.deleteSelected:
                selected.removeSelf();

            default:
                return;
        }
    }
}

listen('keydown', onKeyDown);
