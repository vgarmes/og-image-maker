import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from './lib/canvas';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);

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

    window.addEventListener('resize', () => {
      handleResize({ canvas: fabricRef.current });
    });
  }, []);
  return (
    <div id="canvas" className="h-[100vh] w-full flex justify-center">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
