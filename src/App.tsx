import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from './lib/canvas';
import LeftSidebar from './components/leftsidebar';
import RightSidebar from './components/rightsidebar';

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
    <main className="h-screen overflow-hidden">
      <section className="flex h-full flex-row p-2">
        <LeftSidebar />
        <div id="canvas" className="h-[100vh] w-full flex justify-center">
          <canvas ref={canvasRef}></canvas>
        </div>
        <RightSidebar />
      </section>
    </main>
  );
}

export default App;
