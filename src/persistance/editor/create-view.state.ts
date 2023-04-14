import { clamp } from '../../utils';
import { colors } from '../../view/styles/themeDefault';
import { get, getParsedStyle, getWindowInnerSize } from '../../view/utils/get';
import { Miniature, Vector } from './base-types';
import { Idea } from './idea';

export interface IView {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D | null;
  nodesContainer?: HTMLDivElement;
  miniMap?: HTMLDivElement;
  miniMapViewport?: HTMLDivElement;
  setReferences(): boolean;
  getMiniMapMiniature(position: Vector, size: Vector, id: string): Miniature;
  setMiniMapViewportProportionalSize(): void;
  setMiniMapViewportPosition(x?: number, y?: number): void;
  addMiniMapViewportPosition(x?: number, y?: number): void;
  setMiniMapViewportToPointerPosition(pointerPosition: Vector): void;
  getNodesContainerPosition(): Vector;
  getNodesContainerSize(): Vector;
  setNodesContainerPosition(x?: number, y?: number): void;
  setMapPosition(x?: number, y?: number): void;
  dragMinimapViewport(x?: number, y?: number): void;
  centerOnNode(v: Vector): void;
  centerMindMap(): void;
  getScaleBySpaceName(spaceName: string): Vector;
  translateFullToMiniMapSize(width: number, height: number): Vector;
  translateCoordinatesToSpace(x?: number, y?: number, spaceName?: string): { x: number; y: number };
  getMapCenterCoordinates(): Vector;
  drawBezierCurve(
    start: Vector,
    end: Vector,
    controlPointA: Vector,
    controlPointB: Vector,
    lineWidth?: number,
    color?: string,
  ): void;
  drawMiniature(miniature: Miniature): void;
}

export const createNewView = (): IView => ({
  canvas: undefined,
  context: null,
  nodesContainer: undefined,
  miniMap: undefined,
  miniMapViewport: undefined,

  setReferences(): boolean {
    const canvas = get<HTMLCanvasElement>('canvas');
    if (!canvas) return false;

    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.nodesContainer = get<HTMLDivElement>('#nodes-container');
    this.miniMap = get<HTMLDivElement>('#mini-map');
    this.miniMapViewport = get<HTMLDivElement>('#mini-map__viewport');
    this.setMiniMapViewportProportionalSize();

    return true;
  },

  getMiniMapMiniature(position: Vector, size: Vector, id: string): Miniature {
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
  },

  setMiniMapViewportProportionalSize(): void {
    if (!this.context || !this.nodesContainer || !this.miniMap || !this.miniMapViewport) return;

    const size = getWindowInnerSize();
    const { width: nodesWidth, height: nodesHeight } = getParsedStyle(this.nodesContainer, 'width', 'height');
    const { width: minimapWidth, height: minimapHeight } = getParsedStyle(this.miniMap, 'width', 'height');

    this.miniMapViewport.style.width = `${(size.x * minimapWidth) / nodesWidth}px`;
    this.miniMapViewport.style.height = `${(size.y * minimapHeight) / nodesHeight}px`;
  },

  setMiniMapViewportPosition(x = 0, y = 0): void {
    if (!this.context || !this.nodesContainer || !this.miniMap || !this.miniMapViewport) return;

    this.miniMapViewport.style.left = `${x}px`;
    this.miniMapViewport.style.top = `${y}px`;
  },

  addMiniMapViewportPosition(x = 0, y = 0): void {
    if (!this.context || !this.nodesContainer || !this.miniMap || !this.miniMapViewport) return;

    const mapSize = getParsedStyle(this.miniMap, 'width', 'height');
    const { left, top, width, height } = getParsedStyle(this.miniMapViewport, 'left', 'top', 'width', 'height');
    this.setMiniMapViewportPosition(
      clamp(x + left, 0, mapSize.width - width),
      clamp(y + top, 0, mapSize.height - height),
    );
  },

  setMiniMapViewportToPointerPosition(pointerPosition: Vector): void {
    if (!this.context || !this.nodesContainer || !this.miniMap || !this.miniMapViewport) return;

    const mapStyle = getParsedStyle(this.miniMap, 'width', 'height', 'right', 'bottom');
    const viewportStyle = getParsedStyle(this.miniMapViewport, 'left', 'top', 'width', 'height');
    const size = getWindowInnerSize();
    let pointerInMapX = pointerPosition.x - (size.x - mapStyle.right - mapStyle.width);
    let pointerInMapY = pointerPosition.y - (size.y - mapStyle.bottom - mapStyle.height);

    pointerInMapX -= pointerInMapX - viewportStyle.left;
    pointerInMapY -= pointerInMapY - viewportStyle.top;

    this.setMiniMapViewportPosition(
      clamp(pointerInMapX, 0, mapStyle.width - viewportStyle.width),
      clamp(pointerInMapY, 0, mapStyle.height - viewportStyle.height),
    );
    const positionScaled = this.translateCoordinatesToSpace(-pointerInMapX, -pointerInMapY, 'full');
    this.setNodesContainerPosition(positionScaled.x, positionScaled.y);
  },

  getNodesContainerPosition(): Vector {
    if (!this.nodesContainer) return { x: 0, y: 0 };

    return {
      x: parseInt(this.nodesContainer.style.left, 10),
      y: parseInt(this.nodesContainer.style.top, 10),
    };
  },

  getNodesContainerSize(): Vector {
    if (!this.nodesContainer) return { x: 0, y: 0 };

    return {
      x: parseInt(this.nodesContainer.style.width, 10),
      y: parseInt(this.nodesContainer.style.height, 10),
    };
  },

  setNodesContainerPosition(x = 0, y = 0): void {
    if (!this.nodesContainer) return;

    const size = getWindowInnerSize();
    const containerSize = this.getNodesContainerSize();
    const xInRange = clamp(x, size.x - containerSize.x, 0);
    const yInRange = clamp(y, size.y - containerSize.y, 0);
    this.nodesContainer.style.left = `${xInRange}px`;
    this.nodesContainer.style.top = `${yInRange}px`;
  },

  setMapPosition(x = 0, y = 0): void {
    const { x: left, y: top } = this.getNodesContainerPosition();
    const xMap = x + left;
    const yMap = y + top;
    this.setNodesContainerPosition(xMap, yMap);
    const positionScaled = this.translateCoordinatesToSpace(-xMap, -yMap, 'mini');
    this.setMiniMapViewportPosition(positionScaled.x, positionScaled.y);
  },

  dragMinimapViewport(x = 0, y = 0): void {
    this.addMiniMapViewportPosition(x, y);
    // reflect move of the viewport on the full sized mind map
    const positionScaled = this.translateCoordinatesToSpace(x, y, 'full');
    const containerPosition = this.getNodesContainerPosition();
    this.setNodesContainerPosition(containerPosition.x - positionScaled.x, containerPosition.y - positionScaled.y);
  },

  centerOnNode(node: Idea): void {
    const windowSize = getWindowInnerSize();
    const { x: left, y: top } = this.getNodesContainerPosition();
    this.setMapPosition(-node.x - left + windowSize.x * 0.5, -node.y - top + windowSize.y * 0.5);
  },

  centerMindMap(): void {
    const windowSize = getWindowInnerSize();
    const containerSize = this.getNodesContainerSize();
    this.setMapPosition((-containerSize.x + windowSize.x) * 0.5, (-containerSize.y + windowSize.y) * 0.5);
  },

  getScaleBySpaceName(spaceName: string): Vector {
    const mapSize = getParsedStyle(this.miniMap as Element, 'width', 'height');
    const containerSize = this.getNodesContainerSize();

    let xScale = 1;
    let yScale = 1;

    switch (spaceName) {
      case 'full':
        xScale = containerSize.x / mapSize.width;
        yScale = containerSize.y / mapSize.height;
        break;
      case 'mini':
        xScale = mapSize.width / containerSize.y;
        yScale = mapSize.height / containerSize.x;
        break;
      default:
        break;
    }

    return { x: xScale, y: yScale };
  },

  translateFullToMiniMapSize(width: number, height: number): Vector {
    const { x } = this.getScaleBySpaceName('mini');

    return {
      x: width * x,
      y: height * x,
    };
  },

  translateCoordinatesToSpace(x = 0, y = 0, spaceName = ''): { x: number; y: number } {
    const scale = this.getScaleBySpaceName(spaceName);

    return {
      x: scale.x * x,
      y: scale.y * y,
    };
  },

  getMapCenterCoordinates(): Vector {
    const size = this.getNodesContainerSize();

    return {
      x: size.x * 0.5,
      y: size.y * 0.5,
    };
  },

  drawBezierCurve(
    start: Vector,
    end: Vector,
    controlPointA: Vector,
    controlPointB: Vector,
    lineWidth = 3,
    color = colors.defaultBezerCurve(),
  ): void {
    const { context } = this;
    if (!context) return;

    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.bezierCurveTo(
      start.x + controlPointA.x,
      start.y + controlPointA.y,
      end.x + controlPointB.x,
      end.y + controlPointB.y,
      end.x,
      end.y,
    );
    context.stroke();
  },

  drawMiniature(miniature: Miniature): void {
    const { context } = this;
    if (!context) return;

    const { x, y, width, height } = miniature;
    context.strokeStyle = colors.miniMapMiniature();
    context.fillStyle = 'transparent';
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);
  },
});
