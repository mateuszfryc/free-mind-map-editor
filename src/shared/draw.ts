import { Miniature, Vector } from '../persistance/editor/base-types';
import { Idea } from '../persistance/editor/idea';
import { check, getSafe } from '../utils';
import { RoughCanvas } from '../view/roughjs/canvas';
import rough from '../view/roughjs/rough';
import { colors, theme } from '../view/styles/themeDefault';
import { IView } from './view';

type Connectors = {
  me: Vector;
  parent: Vector;
};

const transparent = 'transparent';

export const draw = {
  roughCanvas: undefined as RoughCanvas | undefined,

  setRoughCanvas(canvas: HTMLCanvasElement): void {
    this.roughCanvas = getSafe<RoughCanvas>(rough.canvas(canvas));
  },

  getConnectorPoints(nodes: Idea[], nodeId: string): Connectors {
    const node = getSafe<Idea>(nodes.find((t) => t.id === nodeId));
    const parent = getSafe<Idea>(nodes.find((t) => t.id === node.parentId));

    const isParentsOnLeft = parent ? parent.x < node.x : false;
    const grandParent = nodes.find((t) => t.id === parent.parentId);
    const isParentsOutOnLeft = parent && grandParent ? grandParent.x < parent.x : isParentsOnLeft;

    const myCorners = node.getCorners();
    const parentCorners = parent.getCorners() ?? myCorners;

    return {
      me: isParentsOnLeft ? myCorners.bottom.left : myCorners.bottom.right,
      parent: isParentsOutOnLeft ? parentCorners.bottom.right : parentCorners.bottom.left,
    };
  },

  drawBezierCurve(
    context: CanvasRenderingContext2D,
    start: Vector,
    end: Vector,
    controlPointA: Vector,
    controlPointB: Vector,
    lineWidth = 3,
    color = colors.defaultBezerCurve(),
  ): void {
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

  roughRectangle(
    idea: Idea,
    seed = 0,
    roughness = 1,
    padding = 0,
    strokeColor = 'transparent',
    fillColor = 'transparent',
  ) {
    if (!this.roughCanvas) return;

    const pos = idea.getViewportPosition();
    const size = idea.getOuterSize();
    const width = size.x + padding;
    const height = size.y + padding;
    this.roughCanvas.rectangle(pos.x - width * 0.5, pos.y - height * 0.5, width, height, {
      seed,
      stroke: strokeColor,
      fill: fillColor,
      roughness,
      fillWeight: 0.5,
    });
  },

  roughEllipse(
    idea: Idea,
    seed = 0,
    roughness = 1,
    padding = 0,
    strokeColor = 'transparent',
    fillColor = 'transparent',
  ) {
    if (!this.roughCanvas) return;

    const pos = idea.getViewportPosition();
    const size = idea.getOuterSize();
    this.roughCanvas.ellipse(pos.x, pos.y, size.x + padding, size.y + padding, {
      seed,
      stroke: strokeColor,
      fill: fillColor,
      roughness,
      hachureGap: 7,
    });
  },

  drawMiniature(context: CanvasRenderingContext2D, miniature: Miniature): void {
    if (!context) return;

    const { x, y, width, height } = miniature;
    context.strokeStyle = colors.miniMapMiniature();
    context.fillStyle = 'transparent';
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);
  },

  drawArrow() {
    //
  },

  mindMap(view: IView, nodes: Idea[], connectorsWidth = 2.2, highlightId?: string, selectedId?: string): void {
    check(view);
    const canvas = getSafe<HTMLCanvasElement>(view.canvas);
    const context = getSafe<CanvasRenderingContext2D>(view.context);
    const rootNode = getSafe<Idea>(nodes.find((n) => n.isRootNode));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    context.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 10;

    nodes.forEach((idea, index) => {
      if (idea.id === highlightId || idea.id === selectedId) {
        const pad = idea.isRootNode ? padding * 3 : padding;
        this.roughEllipse(idea, index + 2, 2.1, pad, transparent, '#ccc');
      }
    });

    this.roughEllipse(rootNode, 1, 1.2, padding * 3, '#999');

    const miniatures: Miniature[] = nodes.map((node) =>
      view.getMiniMapMiniature(node.getPosition(), node.getSize(), node.id),
    );
    miniatures.forEach((miniature) => this.drawMiniature(context, miniature));

    const rootsChildren: Idea[] = nodes.filter((n) => !n.isRootNode);
    const offset: Vector = view.getNodesContainerPosition();

    rootsChildren.forEach((idea: Idea) => {
      const { me, parent } = this.getConnectorPoints(nodes, idea.id);
      const connectorPadding = idea.parentId === rootNode.id ? padding * 1.3 : 0;
      me.x += offset.x /* + connectorPadding * Math.sign(me.x - idea.x) */;
      me.y += offset.y /* + connectorPadding * Math.sign(me.y - idea.y) */;
      parent.x += offset.x + connectorPadding * (idea.prevIsParentOnLeft ? 1 : -1);
      parent.y += offset.y /* + connectorPadding * Math.sign(idea.y - parent.y) */;
      const { x } = me;
      const { x: a } = parent;
      const mod = (x - a) / connectorsWidth;
      const bezierControlPointA = { x: -mod, y: 0 };
      const bezierControlPointB = { x: mod, y: 0 };
      this.drawBezierCurve(
        context,
        me,
        parent,
        bezierControlPointA,
        bezierControlPointB,
        theme.connectorsWidth,
        theme.colors.connectors(),
      );

      // draw miniatures connectors
      const myMiniature = miniatures.filter((mini) => mini.id === idea.id)[0];
      const parentMiniature = miniatures.filter((mini) => mini.id === (idea.parentId ?? -1))[0];
      const xStart = myMiniature.x > parentMiniature.x ? myMiniature.x : myMiniature.x + myMiniature.width;
      const yStart = myMiniature.y + myMiniature.height * 0.5;
      const xEnd = myMiniature.x > parentMiniature.x ? parentMiniature.x + parentMiniature.width : parentMiniature.x;
      const yEnd = parentMiniature.y + parentMiniature.height * 0.5;
      const miniatureMod = (xStart - xEnd) / connectorsWidth;
      const miniatureControlPointA = { x: -miniatureMod, y: 0 };
      const miniatureControlPointB = { x: miniatureMod, y: 0 };

      this.drawBezierCurve(
        context,
        { x: xStart, y: yStart },
        { x: xEnd, y: yEnd },
        miniatureControlPointA,
        miniatureControlPointB,
        1,
        theme.colors.miniatureConnector(),
      );
    });
  },
};
