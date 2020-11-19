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
    
        bezierCurve(start, end, p1, p2, color = '#008fd5') {
            const { context } = this;
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.moveTo(start.x, start.y);
            context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
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
                        this.bezierCurve(me, parent, me, parent);
                    })
                }
            }
        }
    }

    window.draw = new Draw();

})();
