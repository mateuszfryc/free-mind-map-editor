(function() {

    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }

    class Draw {
        constructor() {
            this.canvas = get('#canvas');
            this.context = get('#canvas').getContext('2d');
            this.cameraOffset = new Vector();
        }
    
        bezierCurve(start, end, controllPointA, controllPointB, color = '#008fd5') {
            const { context } = this;
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(start.x, start.y);
            context.bezierCurveTo(
                start.x + controllPointA.x,
                start.y + controllPointA.y,
                end.x + controllPointB.x,
                end.y + controllPointB.y,
                end.x,
                end.y
            );
            context.stroke();
        }
    
        boundingBox(boundingBox) {
            const { x, y, width, height } = boundingBox;
            const { context } = this;
            context.strokeStyle = 'red';
            context.fillStyle = 'transparent';
            context.lineWidth = 1;
            context.strokeRect( x, y, width, height )
        }
    
        connectors() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
            const { rootThought } = store;
            if (rootThought) {
                const rootChildren = rootThought.getChildren(true);
                if (rootChildren.length > 0) {
                    rootChildren.forEach(child => {
                        const { me, parent } = child.getConnectorPoints();
                        me.x += 1;
                        parent.x -= 1;
                        const { x } = me;
                        const { x: a } = parent;
                        const mod = (x - a) / store.connectorsCurveDivider;
                        const bezierControllPointA = new Vector(-mod, 0);
                        const bezierControllPointB = new Vector(mod, 0);
                        this.bezierCurve(
                            me, 
                            parent,
                            bezierControllPointA,
                            bezierControllPointB
                        );
                    })
                }
            }
        }
    }

    window.draw = new Draw();

})();
