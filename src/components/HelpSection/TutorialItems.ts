import SelectGif from 'assets/tutorial/select.gif';
import EditGif from 'assets/tutorial/edit.gif';
import MoveSingletToughtGif from 'assets/tutorial/movesinglenode.gif';
import MoveWithoutChildrenGif from 'assets/tutorial/dragalone.gif';
import MakeChildGif from 'assets/tutorial/makechild.gif';
import MakeSiblingGif from 'assets/tutorial/makesibling.gif';
import ReparentGif from 'assets/tutorial/reparent.gif';
import DragViewportdGif from 'assets/tutorial/dragviewport.gif';
import MinimapdGif from 'assets/tutorial/minimap.gif';

export type TutorialItemType = {
  title: string;
  description: string;
  src: string;
};

export const TutorialItems: TutorialItemType[] = [
  {
    title: 'Select',
    description: 'To select single node click on it once with mouse/touchpad.',
    src: SelectGif,
  },
  {
    title: 'Edit',
    description:
      'To edit single node you can either double click on it with mouse/touchpad or when the node is selected hit Space on the keyboard.',
    src: EditGif,
  },
  {
    title: 'Drag single node around',
    description: 'Click and hold to drag single node around.',
    src: MoveSingletToughtGif,
  },
  {
    title: 'Drag node without children',
    description: 'To drag node without its children hold Shift on keyboard and than drag it.',
    src: MoveWithoutChildrenGif,
  },
  {
    title: 'Make child node',
    description: 'To create new child node hit Tab on the keyboard while the parent is selected.',
    src: MakeChildGif,
  },
  {
    title: 'Make sibling node',
    description: 'To create sibling node hit Enter on the keyboard while the node is selected.',
    src: MakeSiblingGif,
  },
  {
    title: 'Attach child to another node',
    description: 'Click and hold mouse button to drag and drop nodes to new parents.',
    src: ReparentGif,
  },
  {
    title: 'Drag the viewport',
    description: 'Click and hold with mouse/touchpad on the background to move the viewport around.',
    src: DragViewportdGif,
  },
  {
    title: 'Move viewport with mini map',
    description:
      'Click and hold on the viewport miniature on mini map to drag the viewport. You can also just click on the mini map to quickly jump to selected area.',
    src: MinimapdGif,
  },
];
