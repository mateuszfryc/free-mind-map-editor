import styled, { css } from 'styled-components';
import { TFontSize } from '../../styles/themeDefault';

type NodeStyleType = {
  maxWidth: number;
  isSelected: boolean;
  isEdited: boolean;
  zIndex: number;
  fontSize: TFontSize;
};

export const Node = styled.div<NodeStyleType>(
  ({ maxWidth, isSelected, isEdited, zIndex, fontSize, theme: { colors, setFontSize } }) => css`
    ${setFontSize(fontSize)}
    background-color: transparent;
    border: none;
    color: #000;
    cursor: pointer;
    display: inline-block;
    max-width: ${maxWidth}px;
    outline: none;
    overflow: visible;
    padding: 7px 12px;
    position: absolute;
    user-select: none;
    white-space: pre-wrap;
    transition: text-shadow 0.15s linear;
    z-index: ${zIndex};
    overflow-wrap: break-word;
    word-break: break-word;
    word-wrap: break-word;
    hyphens: auto;

    &:hover {
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.7);
    }

    ${isSelected && css``}

    ${isEdited &&
    css`
      visibility: hidden;
    `}
  `,
);

export const Textarea = styled.textarea`
  ${() => css`
    border: none;
    background-color: transparent;
    font-family: inherit;
    font-size: inherit;
    left: -2px;
    margin: 0;
    outline: none;
    overflow: hidden;
    padding: 7px 14px;
    position: absolute;
    resize: none;
    top: 1px;
    visibility: visible;
    min-height: 13px;

    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  `}
`;
