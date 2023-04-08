import styled, { css } from 'styled-components';
import { CustomTheme } from '../styles/themeDefault';

export type ButtonProps = {
  theme: CustomTheme;
  primary?: boolean;
  style?: React.CSSProperties;
};

export const ButtonStyle = ({ theme: { colors, setFontSize }, primary = false }: ButtonProps) => css`
  ${setFontSize('normal')}
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${primary ? colors.primaryDarker() : 'transparent'};
  border: 1px solid ${primary ? 'transparent' : colors.shade(0.7)};
  border-radius: 6px;
  color: ${primary ? colors.primary() : colors.secondary()};
  cursor: pointer;
  padding: 5px 10px;
  transition: background-color 0.15s ease, color 0.15s ease;
  z-index: 11;
  text-decoration: none;

  &:hover,
  &:focus {
    background-color: ${primary ? colors.primaryDarker(0.7) : colors.shade(0.25)};
  }
`;

export const Button = styled.button<ButtonProps>(ButtonStyle);
