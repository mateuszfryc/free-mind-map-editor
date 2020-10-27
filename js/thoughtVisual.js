class ThoughtVisual {
    constructor(parent, defaultText) {
        this.element = this.createElement(parent, defaultText);
    }

    createElement(parent, defaultText) {
        const me = this;
        const element = get('.thought-visual-template').cloneNode();
        element.id = parent.id;
        element.className = 'thought';
        element.thoughtRef = parent;
        element.innerHTML = defaultText;
        element.getThought = function() {
            return parent;
        }
        document.body.appendChild(element);

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

        function edit() {
            if (parent.state !== THOUGHT_STATE.EDITED) parent.edit();
        }

        element.on('dblclick', edit);

        return element;
    }

    getElement() {
        return this.element;
    }

    getValue() {
        const textarea = get('textarea', this.element);

        if (textarea) {
            return textarea.value;
        }

        return this.element.innerHTML;
    }

    getStyle() {
        return window.getComputedStyle(this.element);
    }

    getOuterWidth() {
        const {
            width,
            paddingLeft,
            paddingRight,
            marginLeft,
            marginRight,
            borderLeftWidth,
            borderRightWidth
        } = window.getComputedStyle(this.element);

        return parseInt(width)
            + parseInt(paddingLeft)
            + parseInt(paddingRight)
            + parseInt(marginLeft)
            + parseInt(marginRight)
            + parseInt(borderLeftWidth)
            + parseInt(borderRightWidth);
    }

    getOuterHeight() {
        const {
            height,
            paddingTop,
            paddingBottom,
            marginTop,
            marginBottom,
            borderTopWidth,
            borderBottomWidth
        } = window.getComputedStyle(this.element);

        return parseInt(height)
            + parseInt(paddingTop)
            + parseInt(paddingBottom)
            + parseInt(marginTop)
            + parseInt(marginBottom)
            + parseInt(borderTopWidth)
            + parseInt(borderBottomWidth);
    }

    getWidth() {
        const { width } = window.getComputedStyle(this.element);

        return parseInt(width);
    }

    getHeight() {
        const { height } = window.getComputedStyle(this.element);

        return parseInt(height);
    }

    getSize(returnHalfValues = false) {
        const width = this.getWidth();
        const height = this.getHeight();

        return {
            width: returnHalfValues ? width * 0.5 : width,
            height: returnHalfValues ? height * 0.5 : height,
        }
    }

    getOuterSize(returnHalfValues = false) {
        const width = this.getOuterWidth();
        const height = this.getOuterHeight();

        return {
            width: returnHalfValues ? width * 0.5 : width,
            height: returnHalfValues ? height * 0.5 : height,
        }
    }

    setHeight(height, withScale = true) {
        this.element.style.height = `${withScale ? height * store.scale : height}px`;
    }

    getPosition() {
        const { left, top } = this.element.style;

        return new Vector(
            parseInt(left, 10) * store.scale,
            parseInt(top, 10) * store.scale,
        )
    }

    setPosition(x, y) {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    updateScale() {
        // let { borderWidth, marginTop, marginRight, marginBottom, marginLeft, fontSize } = element.style;
        // borderWidth = parseInt(borderWidth) * store.scale;
        // if (borderWidth < 1) borderWidth = 1;
        // marginTop = parseInt(marginTop) * store.scale;
        // marginRight = parseInt(marginRight) * store.scale;
        // marginBottom = parseInt(marginBottom) * store.scale;
        // marginLeft = parseInt(marginLeft) * store.scale;
        // fontSize = parseInt(fontSize) * store.scale;

        // const newStyle = `
        //     width: ${element.getWidth() * store.scale}px;
        //     height: ${element.getHeight() * store.scale}px;
        //     border-width: ${borderWidth}px;
        //     margin: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px;
        // `;
        // element.setAttribute('style', newStyle);
    }
}
