class ThoughtVisual {
    constructor(parent) {
        this.element = this.createElement(parent);
    }

    createElement(parent) {
        const me = this;
        const element = get('.thought-visual-template').cloneNode();
        element.id = parent.id;
        element.className = 'thought';
        element.thoughtRef = parent;
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

        function resize() {
            store.textTestElement.innerHTML = element.value;
            store.textTestElement.style.fontSize = element.style.fontSize;
            store.textTestElement.style.lineHeight = element.style.lineHeight;
            const textLength = parseInt(window.getComputedStyle(store.textTestElement).width);
            const myWidth = me.getWidth();
            const lineHeight = me.getLineHeight();
            if (element.value === '') {
                me.setHeight(lineHeight);
                return;
            }
            const nuberOfLines = Math.ceil(textLength / myWidth);
            const height = nuberOfLines * lineHeight;
            me.setHeight(height);
        }

        /* 0 timeout to get text after its value was changed */
        function delayedResize () {
            window.setTimeout(resize, 1);
        }

        element.on('change', resize);
        element.on('cut',    delayedResize);
        element.on('paste',  delayedResize);
        element.on('drop',   delayedResize);

        on('keydown', (event) => {
            if (isKeyBindToAction(event)) {
                return;
            }
            delayedResize();
        });

        function edit() {
            if (parent.state !== THOUGHT_STATE.EDITED) parent.edit();
        }

        element.on('dblclick', edit);

        return element;
    }

    getElement() {
        return this.element;
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

    getLineHeight() {
        const { lineHeight } = window.getComputedStyle(this.element);

        return parseInt(lineHeight);
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
