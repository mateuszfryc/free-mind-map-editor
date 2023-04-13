export const addClass = <T extends HTMLElement = HTMLElement>(targetElement: T, className: string): void => {
  // eslint-disable-next-line
  targetElement.className += ` ${className} `;
};

export const removeClass = <T extends HTMLElement = HTMLElement>(targetElement: T, className: string): void => {
  // eslint-disable-next-line
  targetElement.className = targetElement.className.replace(new RegExp(String.raw`\s?${className}\s?`), '');
};

export const getAllElementsUnderPointer = (x: number, y: number): HTMLElement[] => {
  const stack: HTMLElement[] = [];
  let el: HTMLElement | null;
  const maxSteps = 100;
  let count = 0;

  do {
    count++;
    el = document.elementFromPoint(x, y) as HTMLElement;

    const isNotOnStack =
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      stack.every((e) => {
        return el !== null && e.id !== el.id && e.className !== el.className;
      });

    if (isNotOnStack) {
      el.style.pointerEvents = 'none';
      stack.push(el);
    }
  } while (count < maxSteps && el?.tagName !== 'HTML');

  // restore
  stack.forEach((e) => {
    e.style.pointerEvents = 'auto';
  });

  return stack;
};
