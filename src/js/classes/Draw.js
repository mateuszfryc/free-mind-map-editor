(function() {

    class Draw {
        constructor() {
            this.canvas = get('#canvas');
            this.context = get('#canvas').getContext('2d');
            this.thoughtsContainer = get('#thoughts-container');
            this.miniMap = get('#mini-map');
            this.miniMapViewport = get('#mini-map__viewport');
        }
        
        getMiniMapMiniature(thought) {
            const position = thought.getPosition();
            const size = thought.getSize();
            const positionScaled = this.translateCoordinatesToSpace(position.x, position.y, 'mini');
            const sizeScaled = this.translateFullToMiniMapSize(size.x, size.y);
            const windowSize = get.windowInnerSize();
            const miniMap = get.parsedStyle(this.miniMap, 'width', 'height', 'bottom', 'right');
            positionScaled.x += windowSize.width - miniMap.width - miniMap.right - (sizeScaled.x * 0.5);
            positionScaled.y += windowSize.height - miniMap.height - miniMap.bottom - (sizeScaled.y * 0.5);

            const miniature = new BoundingBox(positionScaled.x, positionScaled.y, sizeScaled.x, sizeScaled.y);
            miniature.id = thought.id;
            return miniature;
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
                const positionScaled = this.translateCoordinatesToSpace(x, y, 'mini');
                xTemp = positionScaled.x;
                yTemp = positionScaled.y;
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
            return new Vector(
                parseInt(this.thoughtsContainer.style.width, 10),
                parseInt(this.thoughtsContainer.style.height, 10)
            )
        }

        setThoughtsContainerPosition(x = 0, y = 0) {
            const { width: winWidth,
                height: winHeight } = get.windowInnerSize();
            const containerSize = this.getThoughtsContainerSize();
            const xInRange = clamp(x, winWidth - containerSize.x, 0);
            const yInRange = clamp(y, winHeight - containerSize.y, 0);
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
            
            const containerPosition = this.getThoughtsContainerPosition();
            
            const positionScaled = this.translateCoordinatesToSpace(x, y, 'full');
            this.setThoughtsContainerPosition(containerPosition.x - positionScaled.x, containerPosition.y - positionScaled.y);
        }
        
        centerMindMap() {
            const windowSize = get.windowInnerSize();
            const containerSize = this.getThoughtsContainerSize();
            this.setMapPosition((-containerSize.x + windowSize.width) * 0.5, (-containerSize.y + windowSize.height) * 0.5);
        }
        
        getScaleBySpaceName(spaceName) {
            const mapSize = get.parsedStyle(this.miniMap, 'width', 'height');
            const containerSize = this.getThoughtsContainerSize();
            
            let xScale, yScale;
            
            if (spaceName === 'full') {
                xScale = containerSize.x / mapSize.width;
                yScale = containerSize.y / mapSize.height;
            }
            else if (spaceName === 'mini') {
                xScale = mapSize.width / containerSize.y;
                yScale = mapSize.height / containerSize.x;
            }

            return { x: xScale, y: yScale };
        }
        
        translateFullToMiniMapSize(width, height) {
            let { x } = this.getScaleBySpaceName('mini');

            return {
                x: width * x,
                y: height * x
            }
        }
        
        translateCoordinatesToSpace(x = 0, y = 0, spaceName) {
            const scale = this.getScaleBySpaceName(spaceName);
            
            return {
                x: scale.x * x,
                y: scale.y * y,
            }
        }

        getMapCenterCoordinates() {
            return this.getThoughtsContainerSize().divide(2);
        }
    
        bezierCurve(start, end, controllPointA, controllPointB, lineWidth = 3, color = '#008fd5') {
            const { context } = this;
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
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
            const { position, width, height } = boundingBox;
            const { context } = this;
            context.strokeStyle = 'red';
            context.fillStyle = 'transparent';
            context.lineWidth = 1;
            context.strokeRect(position.x, position.y, width, height);
        }

        connectors() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (store.thoughts.length > 0) {
                const miniatures = [];
                store.thoughts.forEach(thought => {
                    const miniature = this.getMiniMapMiniature(thought);
                    miniatures.push(miniature);
                    this.boundingBox(miniature);
                });
                
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
    
                            // draw miniatures connectors
                            const myMiniature = miniatures.filter(mini => mini.id === child.id)[0];
                            const parentMiniature = miniatures.filter(mini => mini.id === child.parent.id)[0];
                            const xStart = myMiniature.position.x > parentMiniature.position.x
                                ? myMiniature.position.x
                                : myMiniature.position.x + myMiniature.width;
                            const yStart = myMiniature.position.y + (myMiniature.height * 0.5);
                            const xEnd = myMiniature.position.x > parentMiniature.position.x
                                ? parentMiniature.position.x + parentMiniature.width
                                : parentMiniature.position.x
                            const yEnd = parentMiniature.position.y + (parentMiniature.height * 0.5);
                            const miniatureMod = (xStart - xEnd) / store.connectorsCurveDivider;
                            const miniatureControllPointA = new Vector(-miniatureMod, 0);
                            const miniatureControllPointB = new Vector(miniatureMod, 0);
                            this.bezierCurve(
                                new Vector(xStart, yStart), 
                                new Vector(xEnd, yEnd),
                                miniatureControllPointA,
                                miniatureControllPointB,
                                1,
                                'black'
                            );
                        });
                    }
                }
            }
        }
    }

    window.draw = new Draw();

})();
