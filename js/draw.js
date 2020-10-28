const Draw = {
    bezierCurve: function(start, end, p1, p2, color = 'rgb( 255, 0, 0 )') {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 3;
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
    thoughtConnectors: function() {
        const { rootThought } = store;
        if (rootThought) {
            const rootChildren = rootThought.getChildren();
            const { x: a } = rootThought.getPosition();
            if (rootChildren.length > 0) {
                rootChildren.forEach(thought => {
                    const { x } = thought.getPosition();                    
                    const isRootOnTheLeft = a < x;
                    thought.drawConnector(isRootOnTheLeft);
                    const thoughtChildren = thought.getChildren(true);
                    if (thoughtChildren.length > 0) {
                        thoughtChildren.forEach(child => child.drawConnector(isRootOnTheLeft))
                    }

                    // if (store.isDebugDrawOn) {
                    //     thought.getBoundingRectangle().draw();
                    // }
                })
            }
        }
    }
}
