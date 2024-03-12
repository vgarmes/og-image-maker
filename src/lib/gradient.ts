interface ICreateGradient {
  canvas: fabric.Canvas;
  orientation: 'horizontal' | 'vertical' | 'diagonal';
}
export const createGradient = ({ canvas }: ICreateGradient) => {};
