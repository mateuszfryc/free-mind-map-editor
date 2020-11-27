import { Vector, Miniature } from 'types/baseTypes';
import { get, getWindowInnerSize, getParsedStyle } from 'utils/get';
import { clamp } from 'utils/math';

export class ViewController {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    thoughtsContainer: HTMLDivElement;
    miniMap: HTMLDivElement;
    miniMapViewport: HTMLDivElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.thoughtsContainer = get<HTMLDivElement>('#thoughts-container')!;
        this.miniMap = get<HTMLDivElement>('#mini-map')!;
        this.miniMapViewport = get<HTMLDivElement>('#mini-map__viewport')!;

        this.setMiniMapViewportProportionalSize();
    }

    getMiniMapMiniature(position: Vector, size: Vector, id: number): Miniature {
        const positionScaled = this.translateCoordinatesToSpace(position.x, position.y, 'mini');
        const sizeScaled = this.translateFullToMiniMapSize(size.x, size.y);
        const windowSize = getWindowInnerSize();
        const miniMap = getParsedStyle(this.miniMap as Element, 'width', 'height', 'bottom', 'right');
        positionScaled.x += windowSize.x - miniMap.width - miniMap.right - sizeScaled.x * 0.5;
        positionScaled.y += windowSize.y - miniMap.height - miniMap.bottom - sizeScaled.y * 0.5;

        return {
            height: sizeScaled.y,
            width: sizeScaled.x,
            x: positionScaled.x,
            y: positionScaled.y,
            id,
        };
    }

    setMiniMapViewportProportionalSize(): void {
        const size = getWindowInnerSize();
        const { width: thoughtsWidth, height: thoughtsHeight } = getParsedStyle(
            this.thoughtsContainer,
            'width',
            'height'
        );
        const { width: minimapWidth, height: minimapHeight } = getParsedStyle(this.miniMap, 'width', 'height');

        this.miniMapViewport.style.width = `${(size.x * minimapWidth) / thoughtsWidth}px`;
        this.miniMapViewport.style.height = `${(size.y * minimapHeight) / thoughtsHeight}px`;
    }

    setMiniMapViepowrtPosition(x = 0, y = 0): void {
        this.miniMapViewport.style.left = `${x}px`;
        this.miniMapViewport.style.top = `${y}px`;
    }

    addMiniMapViepowrtPosition(x = 0, y = 0): void {
        const mapSize = getParsedStyle(this.miniMap, 'width', 'height');
        const { left, top, width, height } = getParsedStyle(this.miniMapViewport, 'left', 'top', 'width', 'height');
        this.setMiniMapViepowrtPosition(
            clamp(x + left, 0, mapSize.width - width),
            clamp(y + top, 0, mapSize.height - height)
        );
    }

    setMiniMapViepowrtToPointerPosition(pointerPosition: Vector): void {
        const mapStyle = getParsedStyle(this.miniMap, 'width', 'height', 'right', 'bottom');
        const viewportStyle = getParsedStyle(this.miniMapViewport, 'left', 'top', 'width', 'height');
        const size = getWindowInnerSize();
        const pointerInMapX =
            pointerPosition.x - (size.x - mapStyle.right - mapStyle.width) - viewportStyle.width * 0.5;
        const pointerInMapY =
            pointerPosition.y - (size.y - mapStyle.bottom - mapStyle.height) - viewportStyle.height * 0.5;
        this.setMiniMapViepowrtPosition(
            clamp(pointerInMapX, 0, mapStyle.width - viewportStyle.width),
            clamp(pointerInMapY, 0, mapStyle.height - viewportStyle.height)
        );
        const positionScaled = this.translateCoordinatesToSpace(-pointerInMapX, -pointerInMapY, 'full');
        this.setThoughtsContainerPosition(positionScaled.x, positionScaled.y);
    }

    getThoughtsContainerPosition(): Vector {
        return {
            x: parseInt(this.thoughtsContainer.style.left, 10),
            y: parseInt(this.thoughtsContainer.style.top, 10),
        };
    }

    getThoughtsContainerSize(): Vector {
        return {
            x: parseInt(this.thoughtsContainer.style.width, 10),
            y: parseInt(this.thoughtsContainer.style.height, 10),
        };
    }

    setThoughtsContainerPosition(x = 0, y = 0): void {
        const size = getWindowInnerSize();
        const containerSize = this.getThoughtsContainerSize();
        const xInRange = clamp(x, size.x - containerSize.x, 0);
        const yInRange = clamp(y, size.y - containerSize.y, 0);
        this.thoughtsContainer.style.left = `${xInRange}px`;
        this.thoughtsContainer.style.top = `${yInRange}px`;
    }

    setMapPosition(x = 0, y = 0): void {
        const { x: left, y: top } = this.getThoughtsContainerPosition();
        const xMap = x + left;
        const yMap = y + top;
        this.setThoughtsContainerPosition(xMap, yMap);
        const positionScaled = this.translateCoordinatesToSpace(-xMap, -yMap, 'mini');
        this.setMiniMapViepowrtPosition(positionScaled.x, positionScaled.y);
    }

    draggMinimapViewport(x = 0, y = 0): void {
        this.addMiniMapViepowrtPosition(x, y);
        // reflect move of the viewport on the full sized mind map
        const positionScaled = this.translateCoordinatesToSpace(x, y, 'full');
        const containerPosition = this.getThoughtsContainerPosition();
        this.setThoughtsContainerPosition(
            containerPosition.x - positionScaled.x,
            containerPosition.y - positionScaled.y
        );
    }

    centerMindMap(): void {
        const windowSize = getWindowInnerSize();
        const containerSize = this.getThoughtsContainerSize();
        this.setMapPosition((-containerSize.x + windowSize.x) * 0.5, (-containerSize.y + windowSize.y) * 0.5);
    }

    getScaleBySpaceName(spaceName: string): Vector {
        const mapSize = getParsedStyle(this.miniMap as Element, 'width', 'height');
        const containerSize = this.getThoughtsContainerSize();

        let xScale = 1;
        let yScale = 1;

        if (spaceName === 'full') {
            xScale = containerSize.x / mapSize.width;
            yScale = containerSize.y / mapSize.height;
        } else if (spaceName === 'mini') {
            xScale = mapSize.width / containerSize.y;
            yScale = mapSize.height / containerSize.x;
        }

        return { x: xScale, y: yScale };
    }

    translateFullToMiniMapSize(width: number, height: number): Vector {
        const { x } = this.getScaleBySpaceName('mini');

        return {
            x: width * x,
            y: height * x,
        };
    }

    translateCoordinatesToSpace(x = 0, y = 0, spaceName: string): { x: number; y: number } {
        const scale = this.getScaleBySpaceName(spaceName);

        return {
            x: scale.x * x,
            y: scale.y * y,
        };
    }

    getMapCenterCoordinates(): Vector {
        const size = this.getThoughtsContainerSize();

        return {
            x: size.x * 0.5,
            y: size.y * 0.5,
        };
    }

    drawBezierCurve(
        start: Vector,
        end: Vector,
        controllPointA: Vector,
        controllPointB: Vector,
        lineWidth = 3,
        color = '#008fd5'
    ): void {
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

    drawMiniature(miniature: Miniature): void {
        const { x, y, width, height } = miniature;
        const { context } = this;
        context.strokeStyle = 'red';
        context.fillStyle = 'transparent';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }
}
