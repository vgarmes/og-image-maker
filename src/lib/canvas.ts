/* eslint-disable @typescript-eslint/no-explicit-any */
import { fabric } from 'fabric';

import {
  CanvasAction,
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasSelectionCreated,
  SHAPES,
} from '@/types/type';
import { createSpecificShape, createText } from './shapes';
import { v4 as uuidv4 } from 'uuid';

// initialize fabric canvas
export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  // get canvas element
  const canvasElement = document.getElementById('canvas');

  // create fabric canvas
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
  });

  // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = canvas;

  return canvas;
};

// instantiate creation of custom fabric object/shape and add it to canvas
export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  initialCoordinates,
  shapeRef,
  onChangeAction,
}: CanvasMouseDown) => {
  isDrawing.current = false;
  // if selected shape is freeform, set drawing mode to true and return
  if (selectedShapeRef.current === 'select') return;

  /* if (options.target) {
    selectedShapeRef.current === 'select';
    shapeRef.current = options.target;
    onChangeAction('select');
    return;
  } */

  if (selectedShapeRef.current === 'text' && options.pointer) {
    shapeRef.current = createText(options.pointer, 'Tap to edit');

    canvas.add(shapeRef.current);
    canvas.renderAll();
  }

  if (selectedShapeRef.current === 'freeform') {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    return;
  }

  if (SHAPES.includes(selectedShapeRef.current)) {
    isDrawing.current = true;
    const pointer = canvas.getPointer(options.e);
    initialCoordinates.current = pointer;
  }
};

export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  initialCoordinates,
}: CanvasMouseMove) => {
  if (
    !isDrawing.current ||
    selectedShapeRef.current === 'freeform' ||
    !initialCoordinates.current
  )
    return;

  const pointer = canvas.getPointer(options.e);

  if (!shapeRef.current) {
    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer,
      initialCoordinates.current
    );

    canvas.add(shapeRef.current);

    return;
  }

  switch (selectedShapeRef?.current) {
    case 'rectangle':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case 'circle':
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

    case 'triangle':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case 'line':
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case 'image':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    default:
      break;
  }

  // render objects on canvas
  // renderAll: http://fabricjs.com/docs/fabric.Canvas.html#renderAll
  canvas.renderAll();
};

export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  onMouseUp,
  initialCoordinates,
}: CanvasMouseUp) => {
  isDrawing.current = false;

  initialCoordinates.current = null;

  if (selectedShapeRef.current === 'freeform') return;

  // sync shape in storage as drawing is stopped
  syncShapeInStorage(shapeRef.current);

  // set everything to null

  if (!canvas.isDrawingMode) {
    onMouseUp(shapeRef.current);
    //setActiveElement(DEFAULT_NAV_BUTTON);
  }
  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;
};

// update shape in storage when path is created when in freeform mode
export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: CanvasPathCreated) => {
  // get path object
  const path = options.path;
  if (!path) return;

  // set unique id to path object
  path.set({
    objectId: uuidv4(),
  });

  // sync shape in storage
  syncShapeInStorage(path);
};

export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;

  if (target?.type == 'activeSelection') {
    // fix this
  } else {
    syncShapeInStorage(target);
  }
};

// check how object is moving on canvas and restrict it to canvas boundaries
export const handleCanvasObjectMoving = ({
  options,
}: {
  options: fabric.IEvent;
}) => {
  // get target object which is moving
  const target = options.target as fabric.Object;

  // target.canvas is the canvas on which the object is moving
  const canvas = target.canvas as fabric.Canvas;

  // set coordinates of target object
  target.setCoords();

  // restrict object to canvas boundaries (horizontal)
  if (target && target.left) {
    target.left = Math.max(
      0,
      Math.min(
        target.left,
        (canvas.width || 0) - (target.getScaledWidth() || target.width || 0)
      )
    );
  }
  // restrict object to canvas boundaries (vertical)
  if (target && target.top) {
    target.top = Math.max(
      0,
      Math.min(
        target.top,
        (canvas.height || 0) - (target.getScaledHeight() || target.height || 0)
      )
    );
  }
};

// set element attributes when element is selected
export const handleCanvasSelectionCreated = ({
  options,
  isEditingRef,
  setElementAttributes,
}: CanvasSelectionCreated) => {
  // if user is editing manually, return
  if (isEditingRef.current) return;

  // if no element is selected, return
  if (!options?.selected) return;

  // get the selected element
  const selectedElement = options?.selected[0] as fabric.Object;

  // if only one element is selected, set element attributes
  if (selectedElement && options.selected.length === 1) {
    // calculate scaled dimensions of the object

    const scaledWidth = selectedElement?.scaleX
      ? selectedElement?.width! * selectedElement?.scaleX
      : selectedElement?.width;

    const scaledHeight = selectedElement?.scaleY
      ? selectedElement?.height! * selectedElement?.scaleY
      : selectedElement?.height;

    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || '',
      height: scaledHeight?.toFixed(0).toString() || '',
      fill: selectedElement?.fill?.toString() || '',
      stroke: selectedElement?.stroke || '',
      // @ts-expect-error fontSize missing in type def
      fontSize: selectedElement?.fontSize || '',
      // @ts-expect-error fontFamily missing in type def
      fontFamily: selectedElement?.fontFamily || '',
      // @ts-expect-error fontWeight missing in type def
      fontWeight: selectedElement?.fontWeight || '',
    });
  }
};

// update element attributes when element is scaled
export const handleCanvasObjectScaling = ({
  options,
  setElementAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;

  // calculate scaled dimensions of the object
  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || '',
    height: scaledHeight?.toFixed(0).toString() || '',
  }));
};

// zoom canvas on mouse scroll
export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: fabric.IEvent & { e: WheelEvent };
  canvas: fabric.Canvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();

  // allow zooming to min 20% and max 100%
  const minZoom = 0.2;
  const maxZoom = 1;
  const zoomStep = 0.001;

  // calculate zoom based on mouse scroll wheel with min and max zoom
  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

  // set zoom to canvas
  // zoomToPoint: http://fabricjs.com/docs/fabric.Canvas.html#zoomToPoint
  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);

  options.e.preventDefault();
  options.e.stopPropagation();
};

// resize canvas dimensions on window resize
export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const canvasElement = document.getElementById('canvas');
  if (!canvasElement) return;

  if (!canvas) return;
  console.log(canvasElement.scrollHeight);
  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

export const disableCanvasSelections = (canvas: fabric.Canvas) => {
  canvas.forEachObject((obj) => obj.set('selectable', false));
  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
  canvas.selection = false; // removes blue highlight box
  canvas.discardActiveObject().renderAll();
};

export const enableCanvasSelections = (
  canvas: fabric.Canvas,
  activeObject?: fabric.Object
) => {
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  canvas.selection = true;
  canvas.forEachObject((obj) => obj.set('selectable', true));
  if (activeObject) {
    canvas.setActiveObject(activeObject);
  }
  canvas.renderAll();
};
