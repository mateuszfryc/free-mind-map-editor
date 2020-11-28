import { setColorGetter } from 'utils/styles';

const grayBlueDark = '84, 112, 125';
const red = '255, 0, 0';
const blue = '80, 180, 230';
const blueDarker = '40, 90, 115';
const lightBlue = '245, 253, 255';

const dominantColor = blue;

export const colors = {
    primary: setColorGetter(dominantColor),
    primaryDarker: setColorGetter(blueDarker),
    connectors: setColorGetter(dominantColor),
    baseMiniMap: setColorGetter(dominantColor, 0.6),
    miniMapMiniature: setColorGetter(dominantColor),
    mianitureConnector: setColorGetter(red, 0.5),

    defaultBezerCurve: setColorGetter(dominantColor),
    defaultIcon: setColorGetter(dominantColor),
};

export const theme = {
    colors,
    connectorsWidth: 3,
};
