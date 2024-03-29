import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

import { CustomFabricObject } from '@/types/type';

export const handleCopy = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    // Serialize the selected objects
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    // Store the serialized objects in the clipboard
    localStorage.setItem('clipboard', JSON.stringify(serializedObjects));
  }

  return activeObjects;
};

export const handlePaste = (
  canvas: fabric.Canvas,
  syncShapeInStorage: (shape: fabric.Object) => void
) => {
  if (!canvas || !(canvas instanceof fabric.Canvas)) {
    console.error('Invalid canvas object. Aborting paste operation.');
    return;
  }

  // Retrieve serialized objects from the clipboard
  const clipboardData = localStorage.getItem('clipboard');

  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      parsedObjects.forEach((objData: fabric.Object) => {
        // convert the plain javascript objects retrieved from localStorage into fabricjs objects (deserialization)
        fabric.util.enlivenObjects(
          [objData],
          (enlivenedObjects: fabric.Object[]) => {
            enlivenedObjects.forEach((enlivenedObj) => {
              // Offset the pasted objects to avoid overlap with existing objects
              enlivenedObj.set({
                left: enlivenedObj.left || 0 + 20,
                top: enlivenedObj.top || 0 + 20,
                objectId: uuidv4(),
                fill: '#aabbcc',
              } as CustomFabricObject<any>);

              canvas.add(enlivenedObj);
              syncShapeInStorage(enlivenedObj);
            });
            canvas.renderAll();
          },
          'fabric'
        );
      });
    } catch (error) {
      console.error('Error parsing clipboard data:', error);
    }
  }
};

interface ActiveObject extends fabric.Object {
  selected?: boolean;
  text?: string;
}
const isDeletingText = (obj: ActiveObject) =>
  obj.text && obj.selected === false;

export const handleDelete = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects(); // for some reason this also includes a text object that is being edited
  const selectedObjects = activeObjects.filter((obj) => !isDeletingText(obj));

  if (!selectedObjects || selectedObjects.length === 0) return;

  selectedObjects.forEach((obj) => {
    canvas.remove(obj);
    //deleteShapeFromStorage(obj.objectId);
  });

  canvas.discardActiveObject(); // otherwise selectors still show on screen
  canvas.requestRenderAll();
};

// create a handleKeyDown function that listen to different keydown events
export const handleKeyDown = ({
  e,
  canvas,
  undo,
  redo,
  syncShapeInStorage,
  deleteShapeFromStorage,
  shapeRef,
}: {
  e: KeyboardEvent;
  canvas: fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: fabric.Object) => void;
  deleteShapeFromStorage: (id: string) => void;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
}) => {
  if (!canvas) return;
  // Check if the key pressed is ctrl/cmd + c (copy)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 67) {
    handleCopy(canvas);
  }

  // Check if the key pressed is ctrl/cmd + v (paste)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 86) {
    handlePaste(canvas, syncShapeInStorage);
  }

  // Check if the key pressed is delete/backspace (delete)
  if (e.code === 'Backspace' || e.code === 'Delete') {
    handleDelete(canvas);
  }

  // check if the key pressed is ctrl/cmd + x (cut)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas);
  }

  // check if the key pressed is ctrl/cmd + z (undo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 90) {
    undo();
  }

  // check if the key pressed is ctrl/cmd + y (redo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 89) {
    redo();
  }

  if (e.keyCode === 191 && !e.shiftKey) {
    e.preventDefault();
  }
};
