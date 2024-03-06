import { CustomFabricObject, PointerCoords } from '@/types/type';
import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';

export const createRectangle = (
  pointerCoords: PointerCoords,
  initialCoords: PointerCoords
) => {
  const rect = new fabric.Rect({
    left: initialCoords.x,
    top: initialCoords.y,
    width: pointerCoords.x - initialCoords.x,
    height: pointerCoords.y - initialCoords.y,
    fill: '#aabbcc',
    objectId: uuid(),
  } as CustomFabricObject);

  return rect;
};

export const createTriangle = (
  pointer: PointerCoords,
  initialCoordinates: PointerCoords
) => {
  return new fabric.Triangle({
    left: initialCoordinates.x,
    top: initialCoordinates.y,
    width: pointer.x - initialCoordinates.x,
    height: pointer.y - initialCoordinates.y,
    fill: '#aabbcc',
    objectId: uuid(),
  } as CustomFabricObject);
};

export const createLine = (
  pointer: PointerCoords,
  startingPoint: PointerCoords
) => {
  return new fabric.Line(
    [
      startingPoint.x,
      startingPoint.y,
      pointer.x - startingPoint.x,
      pointer.y - startingPoint.y,
    ],
    {
      stroke: '#aabbcc',
      strokeWidth: 2,
      objectId: uuid(),
    } as CustomFabricObject
  );
};

export const createText = (pointer: PointerEvent, text: string) => {
  return new fabric.IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: '#aabbcc',
    fontFamily: 'Helvetica',
    fontSize: 36,
    fontWeight: '400',
    objectId: uuid(),
  } as fabric.ITextOptions);
};

export const createSpecificShape = (
  shapeType: string,
  pointer: PointerCoords,
  startingPoint: PointerCoords
) => {
  switch (shapeType) {
    case 'rectangle':
      return createRectangle(pointer, startingPoint);

    case 'triangle':
      return createTriangle(pointer, startingPoint);

    case 'circle':
      return createCircle(pointer, startingPoint);

    case 'line':
      return createLine(pointer, startingPoint);

    case 'text':
      return createText(pointer, 'Tap to Type');

    default:
      return null;
  }
};

export const createCircle = (
  pointer: PointerCoords,
  initialCoordinates: PointerCoords
) => {
  return new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: Math.sqrt(
      Math.pow(pointer.x - initialCoordinates.x, 2) +
        Math.pow(pointer.y - initialCoordinates.y, 2)
    ),
    fill: '#aabbcc',
    objectId: uuid(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};
