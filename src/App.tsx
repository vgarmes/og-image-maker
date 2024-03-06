import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
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
import { Attributes, ButtonValue } from './types/type';
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
  const initialCoordinates = useRef<PointerCoords | null>(null);
  const isEditingRef = useRef(false);
  const [activeButton, setActiveButton] = useState<ButtonValue | null>(
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

  const handleActiveButton = (button: ButtonValue) => {
    if (!canvasObj.current) return;
    if (button === 'reset') {
      setActiveButton(null);
      // clear storage
      // deleteAllShapes();

      // clear canvas
      fabricRef.current?.clear();
      return;
    }

    setActiveButton(button);

    if (button !== 'select') {
      canvasObj.current.forEachObject((obj) => obj.set('selectable', false));
      canvasObj.current.discardActiveObject().renderAll();
    } else {
      canvasObj.current.forEachObject((obj) => obj.set('selectable', true));
    }
    switch (button) {
      case 'delete':
        // handle delete
        break;
      default:
        selectedShapeRef.current = button;
        break;
    }
  };

  useEffect(() => {
    canvasObj.current = initializeFabric({ canvasRef, fabricRef });
    const canvas = canvasObj.current;

    canvas.on('mouse:down', (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        initialCoordinates,
        shapeRef,
        onChangeAction: handleActiveButton,
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
        setActiveElement: handleActiveButton,
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
  }, [canvasRef]);

  return (
    <main className="flex flex-col h-screen w-full overflow-hidden p-4">
      <Navbar
        activeButton={activeButton}
        handleActiveButton={handleActiveButton}
      />
      <div className="flex flex-grow w-full gap-4">
        <div id="canvas" className="h-full w-full border border-red-600">
          <canvas ref={canvasRef}></canvas>
        </div>

        <LeftSidebar />
      </div>
    </main>
  );
}

export default App;
