// import original module declarations
import 'styled-components';
import { CustomTheme } from 'styles/themeDefault';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends CustomTheme {}
}
