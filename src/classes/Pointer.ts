import { Vector } from 'types/baseTypes';

export class Pointer {
  isLeftButtonDown: boolean;
  wasShiftPressedOnDown: boolean;
  position: Vector;
  lastPosition: Vector;
  draggedItemId: string | undefined;

  constructor() {
    this.isLeftButtonDown = false;
    this.wasShiftPressedOnDown = false;
    this.position = { x: 0, y: 0 };
    this.lastPosition = { x: 0, y: 0 };
    this.draggedItemId = undefined;
  }

  getPosition(): Vector {
    return { x: this.position.x, y: this.position.y };
  }

  setIsLeftButtonDown(isDown: boolean): void {
    this.isLeftButtonDown = isDown;
  }

  getCurrentToLastPositionDiff(): Vector {
    return {
      x: this.position.x - this.lastPosition.x,
      y: this.position.y - this.lastPosition.y,
    };
  }

  setDraggedId(id: string): void {
    this.draggedItemId = id;
  }

  clearDraggedId(): void {
    this.draggedItemId = undefined;
  }

  setWasShiftPressedOnDown(isShiftPressed: boolean): void {
    this.wasShiftPressedOnDown = isShiftPressed;
  }
}
