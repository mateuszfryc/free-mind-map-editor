export const setColorGetter = (color: string, opacityMultiplier = 1): ((n?: number) => string) => (
    opacity = 1
): string => {
    return `rgba(${color}, ${opacity * opacityMultiplier})`;
};
