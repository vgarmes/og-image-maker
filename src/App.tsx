import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  handleCanvasMouseDown,
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
  const [activeButton, setActiveButton] = useState<ButtonValue | null>(null);

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
    <main className="h-screen w-full overflow-hidden">
      <div className="absolute w-full h-full z-10 p-4">
        <Navbar
          activeButton={activeButton}
          handleActiveButton={(button) => setActiveButton(button)}
        />
        <LeftSidebar />
      </div>
      <div id="canvas" className="h-full w-full flex justify-center flex-col">
        <canvas ref={canvasRef}></canvas>
      </div>
    </main>
  );
}

export default App;
