import { setColorGetter } from 'utils/styles';
import { ObjectOfNumbers, ObjectOfStrings } from 'types/baseTypes';

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
const blueDarker = '40, 90, 115';

const darkGray = '20, 20, 20';
const gray = '110, 110, 110';

const dominantColor = darkGray;

export const colors = {
    primary: setColorGetter(dominantColor),
    secondary: setColorGetter(white),
    shade: setColorGetter(gray),
    contrast: setColorGetter(lightBlue),

    white: setColorGetter(white),
    primaryDarker: setColorGetter(blueDarker),
    connectors: setColorGetter(dominantColor),
    baseMiniMap: setColorGetter(dominantColor, 0.6),
    miniMapMiniature: setColorGetter(dominantColor),
    mianitureConnector: setColorGetter(red, 0.5),

    defaultBezerCurve: setColorGetter(dominantColor),
    defaultIcon: setColorGetter(dominantColor),
};

const fontSizes: ObjectOfNumbers = {
    sectionTitle: 4,
    title: 2,
    paragraph: 1.6,
};

const setFontSize = (size: string): string => {
    const regularSize: number = fontSizes[size];

    return `
        font-size: ${regularSize}rem;
        line-height: ${regularSize * 1.15}rem;
    `;
};

export const theme = {
    colors,
    connectorsWidth: 3,
    fontSizes,
    setFontSize,
};
