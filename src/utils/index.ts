export const MouseDownResizer = (e: MouseEvent, width: number, onMouseMove: (newWidth: number) => void) => {
  let element: HTMLElement = e.target as HTMLElement;

  let x = e.clientX;
  let _width: number = width;
  element.style.cursor = 'col-resize';
  const onMouseMoveHandler = (e: MouseEvent) => {

    const dx = e.clientX - x;

    return onMouseMove(_width + dx);
  };

  const onMouseUpHandler = (e: MouseEvent) => {

    element.style.removeProperty('cursor');
    document.removeEventListener('mousemove', onMouseMoveHandler);
    document.removeEventListener('mouseup', onMouseUpHandler);
  };

  document.addEventListener('mousemove', onMouseMoveHandler);
  document.addEventListener('mouseup', onMouseUpHandler);

};
