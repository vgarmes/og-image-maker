import {
  Square,
  Circle,
  Triangle,
  Slash,
  Brush,
  BoxSelect,
  Type,
  Eraser,
  Undo,
} from 'lucide-react';
import { ButtonValue, MenuButton } from '@/types/type';
import { clsx } from 'clsx';

interface Props {
  activeButton: ButtonValue;
  handleActiveButton: (button: ButtonValue) => void;
}

const navElements: MenuButton[] = [
  {
    icon: <BoxSelect />,
    name: 'Select',
    value: 'select',
  },
  {
    icon: <Square />,
    name: 'Rectangle',
    value: 'rectangle',
  },
  {
    icon: <Circle />,
    name: 'Circle',
    value: 'circle',
  },
  {
    icon: <Triangle />,
    name: 'Triangle',
    value: 'triangle',
  },
  {
    icon: <Slash />,
    name: 'Line',
    value: 'line',
  },
  {
    icon: <Brush />,
    name: 'Free Drawing',
    value: 'freeform',
  },
  {
    icon: <Type />,
    value: 'text',
    name: 'Text',
  },
  {
    icon: <Eraser />,
    value: 'delete',
    name: 'Delete',
  },
  {
    icon: <Undo />,
    value: 'reset',
    name: 'Reset',
  },
];

const Navbar = ({ activeButton, handleActiveButton }: Props) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex items-center justify-center gap-3 bg-zinc-800 rounded-lg p-1">
        {navElements
          .filter((element) => Boolean(element))
          .map(({ value, icon }) => {
            const isActive = activeButton && activeButton === value;

            return (
              <button
                className={clsx(
                  'text-primary rounded-lg size-9 inline-flex items-center justify-center *:size-4',
                  {
                    'hover:bg-zinc-700': !isActive,
                    'bg-indigo-400/60': isActive,
                  }
                )}
                onClick={() => handleActiveButton(value)}
              >
                {icon}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Navbar;
