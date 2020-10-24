function createInteractableTextarea(parent) {
    const element = document.createElement('textarea');
    element.className = 'thought';

    if (!element.hasOwnProperty('remove')) {
        Object.defineProperty(element, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                this.parentNode.removeChild(this);
            }
        })
    }

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
        const textLengthArea = get('.text-length');
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
    element.thoughtRef = parent;
    parent.interactable = element;

    return element;
}
