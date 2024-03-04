import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvaseMouseMove,
  handleResize,
  initializeFabric,
} from './lib/canvas';
import LeftSidebar from './components/leftsidebar';

import Navbar from './components/navbar';
import { ButtonValue } from './types/type';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const isEditingRef = useRef(false);
  const [activeButton, setActiveButton] = useState<ButtonValue | null>(null);

  const handleActiveButton = (button: ButtonValue) => {
    if (button === 'reset') {
      setActiveButton(null);
      // clear storage
      // deleteAllShapes();

      // clear canvas
      fabricRef.current?.clear();
      return;
    }

    setActiveButton(button);

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
    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on('mouse:down', (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    canvas.on('mouse:move', (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        selectedShapeRef,
        shapeRef,
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
        setActiveElement: setActiveButton,
      });
    });

    window.addEventListener('resize', () => {
      handleResize({ canvas: fabricRef.current });
    });
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
