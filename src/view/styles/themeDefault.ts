import { ObjectOfStrings } from 'persistance/editor/base-types';
import { css, FlattenSimpleInterpolation } from 'styled-components';
import { setBoxShadow, setColorGetter } from 'view/styles/styles';

export const breakpoints: ObjectOfStrings = {
  phone: '576',
  tablet: '768',
  bigTablet: '1024',
  desktop: '1280',
  bigDesktop: '1600',
};

const white = '255, 255, 255';
const lightBlue = '0, 190, 250';
const red = '255, 0, 0';
const blueDarker = '40, 170, 210';

const darkGray = '100, 100, 100';
const gray = '180, 180, 180';

const dominantColor = darkGray;

export const colors = {
  primary: setColorGetter(white),
  secondary: setColorGetter(dominantColor),
  shade: setColorGetter(gray),
  contrast: setColorGetter(lightBlue),

  white: setColorGetter(white),
  primaryDarker: setColorGetter(blueDarker),
  connectors: setColorGetter(dominantColor),
  baseMiniMap: setColorGetter(dominantColor, 0.6),
  miniMapMiniature: setColorGetter(dominantColor),
  miniatureConnector: setColorGetter(red, 0.5),

  defaultBezerCurve: setColorGetter(dominantColor),
  defaultIcon: setColorGetter(dominantColor),
};

const fontSizes = {
  sectionTitle: 4,
  title: 2.4,
  subtitle: 1.8,
  itemTitle: 1.3,
  normal: 1,
};

export type TFontSize = keyof typeof fontSizes;

const setFontSize = (size: TFontSize): string => {
  const regularSize: number = fontSizes[size];

  return `
        font-size: ${regularSize}rem;
        line-height: ${regularSize * 1.15}rem;
    `;
};

export const chessboardBackground = (
  size: number,
  darkColor: string,
  brightColor: string,
): FlattenSimpleInterpolation => {
  const halfSize = size * 0.5;

  return css`
    background-image: linear-gradient(45deg, ${darkColor} 25%, ${brightColor} 25%),
      linear-gradient(-45deg, ${darkColor} 25%, ${brightColor} 25%),
      linear-gradient(45deg, ${brightColor} 75%, ${darkColor} 75%),
      linear-gradient(-45deg, ${brightColor} 75%, ${darkColor} 75%);
    background-size: ${size}px ${size}px;
    background-position: 0 0, 0 ${halfSize}px, ${halfSize}px -${halfSize}px, -${halfSize}px 0;
  `;
};

export const theme = {
  setBoxShadow,
  chessboardBackground,
  colors,
  connectorsWidth: 2,
  fontSizes,
  setFontSize,
  borderRadius: 6,
};

export type CustomTheme = typeof theme;
