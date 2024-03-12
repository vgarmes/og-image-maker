import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  disableCanvasSelections,
  enableCanvasSelections,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handleCanvaseMouseMove,
  handlePathCreated,
  handleResize,
  initializeFabric,
} from './lib/canvas';
import LeftSidebar from './components/leftsidebar';

import Navbar from './components/navbar';
import { Attributes, CanvasAction, Coordinates, SHAPES } from './types/type';
import { handleKeyDown } from './lib/key-events';
import { DEFAULT_NAV_BUTTON } from './constants';

function App() {
  const canvasObj = useRef<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const initialCoordinates = useRef<Coordinates | null>(null);
  const isEditingRef = useRef(false);
  const [activeAction, setActiveAction] = useState<CanvasAction | null>(
    DEFAULT_NAV_BUTTON
  );
  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: '',
    height: '',
    fontSize: '',
    fontFamily: '',
    fontWeight: '',
    fill: '#aabbcc',
    stroke: '#aabbcc',
  });

  const handleActiveAction = (
    action: CanvasAction,
    activeObject?: fabric.Object
  ) => {
    if (!canvasObj.current) return;
    if (action === 'reset') {
      // clear storage
      // deleteAllShapes();

      // clear canvas
      fabricRef.current?.clear();
      setActiveAction(DEFAULT_NAV_BUTTON);
      return;
    }

    setActiveAction(action);

    // handle mouse style
    if (SHAPES.includes(action)) {
      disableCanvasSelections(canvasObj.current);
    } else {
      enableCanvasSelections(canvasObj.current, activeObject);
    }

    switch (action) {
      case 'delete':
        // handle delete
        break;
      default:
        selectedShapeRef.current = action;
        break;
    }
  };

  useEffect(() => {
    canvasObj.current = initializeFabric({ canvasRef, fabricRef });

    const canvas = canvasObj.current;
    const gradient = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'pixels', // or 'percentage'
      coords: { x1: 0, y1: 0, x2: 0, y2: canvas.height },
      colorStops: [
        { offset: 0, color: 'rgb(99 102 241)' },
        { offset: 0.5, color: 'rgb(168 85 247)' },
        { offset: 1, color: 'rgb(236 72 153)' },
      ],
    });
    canvas.setBackgroundColor(gradient, canvas.renderAll.bind(canvas));

    canvas.on('mouse:down', (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        initialCoordinates,
        shapeRef,
        onChangeAction: handleActiveAction,
      });
    });

    canvas.on('mouse:move', (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        selectedShapeRef,
        shapeRef,
        initialCoordinates,
      });
    });

    canvas.on('mouse:up', () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage: () => null,
        onMouseUp: (activeObject) => handleActiveAction('select', activeObject),
        initialCoordinates,
      });
    });

    canvas.on('path:created', (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage: () => null,
      });
    });

    canvas.on('object:modified', (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage: () => null,
      });
    });

    canvas?.on('object:moving', (options) => {
      handleCanvasObjectMoving({
        options,
      });
    });

    /**
     * listen to the selection created event on the canvas which is fired
     * when the user selects an object on the canvas.
     *
     * Event inspector: http://fabricjs.com/events
     * Event list: http://fabricjs.com/docs/fabric.Canvas.html#fire
     */
    canvas.on('selection:created', (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on('object:scaling', (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on('mouse:wheel', (options) => {
      handleCanvasZoom({
        options,
        canvas,
      });
    });

    /**
     * listen to the key down event on the window which is fired when the
     * user presses a key on the keyboard.
     *
     * We're using this to perform some actions like delete, copy, paste, etc when the user presses the respective keys on the keyboard.
     */

    const handleKeyboardEvent = (e: KeyboardEvent) =>
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo: () => null,
        redo: () => null,
        syncShapeInStorage: () => null,
        deleteShapeFromStorage: () => null,
        shapeRef,
      });
    window.addEventListener('keydown', handleKeyboardEvent);

    window.addEventListener('resize', () => {
      console.log('resizing');
      handleResize({ canvas: fabricRef.current });
    });

    return () => {
      canvas.dispose();

      window.removeEventListener('resize', () => {
        handleResize({
          canvas: null,
        });
      });

      window.removeEventListener('keydown', handleKeyboardEvent);
    };
  }, []);

  return (
    <main className="flex flex-col h-screen w-full p-4">
      <Navbar
        activeButton={activeAction}
        handleActiveButton={handleActiveAction}
      />
      <div className="flex flex-grow w-full gap-4">
        <div
          id="canvas"
          className="border border-red-600 rounded overflow-hidden self-start flex-grow max-w-[1200px]"
          style={{ aspectRatio: '1.91 / 1' }}
        >
          <canvas ref={canvasRef}></canvas>
        </div>

        <LeftSidebar />
      </div>
    </main>
  );
}

export default App;
