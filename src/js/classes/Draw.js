(function() {

    class Draw {
        constructor() {
            this.canvas = get('#canvas');
            this.context = get('#canvas').getContext('2d');
            this.thoughtsContainer = get('#thoughts-container');
            this.miniMap = get('#mini-map');
            this.miniMapViewport = get('#mini-map__viewport');
            this.miniMapMiniatures = [];
        }
        
        addMiniMapMiniature(thought) {
            const { x, y } = thought.getPosition();
            const { xScaled, yScaled } = this.translateCoordinatesToSpace(x, y, 'full');
            const { x: width, y: height } = thought.getSize();
            const { scaledWidth, scaledHeight} = translateFullToMiniMapSize(width, height);
            this.miniMapMiniatures.push({
                id: thought.id,
                color: thought.isRootThought
                    ? 'red'
                    : 'blue',
                position: new Vector(xScaled, yScaled),
                size: new Vector(scaledWidth, scaledHeight)
            });
        }
        
        setMiniMapViewportProportionalSize() {
            const {
                width: windowWidth,
                height: windowHeight } = get.windowInnerSize();
            const {
                width: thoughtsWidth,
                height: thoughtsHeight } = get.parsedStyle(this.thoughtsContainer, 'width', 'height');
            const {
                width: minimapWidth,
                height: minimapHeight } = get.parsedStyle(this.miniMap, 'width', 'height');
            
            this.miniMapViewport.style.width = `${(windowWidth * minimapWidth) / thoughtsWidth}px`;
            this.miniMapViewport.style.height = `${(windowHeight * minimapHeight) / thoughtsHeight}px`;
        }
        
        setMiniMapViepowrtPosition(x = 0, y = 0, convertToMiniMapSpace = false) {
            const {
                width: mapWidth,
                height: mapHeight } = get.parsedStyle(this.miniMap, 'width', 'height');
            let {
                left,
                top,
                width,
                height } = get.parsedStyle(this.miniMapViewport, 'left', 'top', 'width', 'height');
            let xTemp, yTemp;
            
            if (convertToMiniMapSpace) {
                const { xScaled, yScaled } = this.translateCoordinatesToSpace(x, y, 'mini');
                xTemp = xScaled;
                yTemp = yScaled;
            }
            else {
                xTemp = clamp(x + left, 0, mapWidth - width);
                yTemp = clamp(y + top, 0, mapHeight - height);
            }

            this.miniMapViewport.style.left = `${xTemp}px`;
            this.miniMapViewport.style.top = `${yTemp}px`;
        }
        
        getThoughtsContainerPosition() {
            return {
                x: parseInt(this.thoughtsContainer.style.left, 10),
                y: parseInt(this.thoughtsContainer.style.top, 10)
            }            
        }
        
        getThoughtsContainerSize() {
            return {
                width: parseInt(this.thoughtsContainer.style.width, 10),
                height: parseInt(this.thoughtsContainer.style.height, 10)
            }            
        }

        setThoughtsContainerPosition(x = 0, y = 0) {
            const { width: winWidth,
                height: winHeight } = get.windowInnerSize();
            const { width, height } = this.getThoughtsContainerSize();
            const xInRange = clamp(x, winWidth - width, 0);
            const yInRange = clamp(y, winHeight - height, 0);
            this.thoughtsContainer.style.left = `${xInRange}px`;
            this.thoughtsContainer.style.top = `${yInRange}px`;
        }
        
        setMapPosition(x = 0, y = 0,) {
            const { x: left, y: top } = this.getThoughtsContainerPosition();
            const xMap = x + left;
            const yMap = y + top;
            this.setThoughtsContainerPosition(xMap, yMap);
            this.setMiniMapViepowrtPosition(-xMap, -yMap, true);
        }
        
        draggMinimapViewport(x = 0, y = 0) {
            this.setMiniMapViepowrtPosition(x, y);
            
            let { x: left, y: top, } = this.getThoughtsContainerPosition();
            
            const { xScaled, yScaled } = this.translateCoordinatesToSpace(x, y, 'full');
            this.setThoughtsContainerPosition(left - xScaled, top - yScaled);
        }
        
        centerMindMap() {
            const { width: winWidth, height: winHeight } = get.windowInnerSize();
            const { width, height } = this.getThoughtsContainerSize();
            this.setMapPosition((-width + winWidth) * 0.5, (-height + winHeight) * 0.5);
        }
        
        getScaleBySpaceName(spaceName) {
            const {
                width: mapWidth,
                height: mapHeight } = get.parsedStyle(this.miniMap, 'width', 'height');
            const {
                width: thoughtsWidth,
                height: thoughtsHeight } = this.getThoughtsContainerSize();
            
            let xScale, yScale;
            
            if (spaceName === 'full') {
                xScale = thoughtsWidth / mapWidth;
                yScale = thoughtsHeight / mapHeight;
            }
            else if (spaceName === 'mini') {
                xScale = mapWidth / thoughtsWidth;
                yScale = mapHeight / thoughtsHeight;
            }
            
            return { xScale, yScale };
        }
        
        translateFullToMiniMapSize(width, height) {
            let { xScale, yScale } = this.getScaleBySpaceName('mini');
            
            return {
                widthScaled: width * xScale,
                heightScaled: height * yScale
            }
        }
        
        translateCoordinatesToSpace(x = 0, y = 0, spaceName) {
            let { xScale, yScale } = this.getScaleBySpaceName(spaceName);
            
            xScale *= x;
            yScale *= y;
            
            return {
                xScaled: xScale,
                yScaled: yScale,
            }
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
                        const offset = this.getThoughtsContainerPosition();
                        me.addV(offset);
                        parent.addV(offset);
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
        
        miniMapMiniatures() {
            store.thoughts.forEach(thought => {
                
            });
        }
    }

    window.draw = new Draw();

})();
