export const setBoxShadow = (
  blur = 10,
  color = 'rgba(0, 0, 0, 0.3)',
  spread = 1,
  shiftRight = 0,
  shiftDown = 0,
): string => `
    box-shadow: ${shiftRight}px ${shiftDown}px ${blur}px ${spread}px ${color};
`;

export const setColorGetter =
  (color: string, opacityMultiplier = 1): ((n?: number) => string) =>
  (opacity = 1): string =>
    `rgba(${color}, ${opacity * opacityMultiplier})`;
