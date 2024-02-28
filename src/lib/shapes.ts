import { CustomFabricObject } from '@/types/type';
import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';

export const createRectangle = (pointer: PointerEvent) => {
  const rect = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: '#aabbcc',
    objectId: uuid(),
  } as CustomFabricObject);

  return rect;
};

export const createTriangle = (pointer: PointerEvent) => {
  return new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: '#aabbcc',
    objectId: uuid(),
  } as CustomFabricObject);
};

export const createLine = (pointer: PointerEvent) => {
  return new fabric.Line(
    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
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
  pointer: PointerEvent
) => {
  switch (shapeType) {
    case 'rectangle':
      return createRectangle(pointer);

    case 'triangle':
      return createTriangle(pointer);

    case 'circle':
      return createCircle(pointer);

    case 'line':
      return createLine(pointer);

    case 'text':
      return createText(pointer, 'Tap to Type');

    default:
      return null;
  }
};

export const createCircle = (pointer: PointerEvent) => {
  return new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 100,
    fill: '#aabbcc',
    objectId: uuid(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};
