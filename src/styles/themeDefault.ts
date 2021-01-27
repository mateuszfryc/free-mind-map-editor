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
const grayBlueDark = '84, 112, 125';
const red = '255, 0, 0';
const blue = '80, 180, 230';
const blueDarker = '40, 90, 115';
const lightBlue = '245, 253, 255';

const dominantColor = blue;

export const colors = {
    white: setColorGetter(white),

    primary: setColorGetter(dominantColor),
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
