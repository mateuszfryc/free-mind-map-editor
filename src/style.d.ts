// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface FontSizes {
    sectionTitle: number;
    title: number;
    paragraph: number;
  }

  export interface DefaultTheme {
    setBoxShadow: (blur: number, color: string, spread: number, shiftRight: number, shiftDown: number) => string;
    chessboardBackground: (size: number, darkColor: string, brightColor: string) => FlattenSimpleInterpolation;
    setFontSize: (size: keyof FontSizes) => string;
    colors: {
      primary: (n?: number | undefined) => string;
      secondary: (n?: number | undefined) => string;
      shade: (n?: number | undefined) => string;
      contrast: (n?: number | undefined) => string;
      white: (n?: number | undefined) => string;
      primaryDarker: (n?: number | undefined) => string;
      connectors: (n?: number | undefined) => string;
      baseMiniMap: (n?: number | undefined) => string;
      miniMapMiniature: (n?: number | undefined) => string;
      miniatureConnector: (n?: number | undefined) => string;
      defaultBezerCurve: (n?: number | undefined) => string;
      defaultIcon: (n?: number | undefined) => string;
    };
    connectorsWidth: number;
    fontSizes: FontSizes;
  }
}
