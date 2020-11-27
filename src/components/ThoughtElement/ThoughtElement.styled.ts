import styled, { css } from 'styled-components';

type ThoughtStyleType = {
    maxWidth: number;
    isSelected: boolean;
    isEdited: boolean;
    zIndex: number;
};

export const Thought = styled.div<ThoughtStyleType>`
    ${({ maxWidth, isEdited, zIndex }) => css`
        background-color: #fff;
        border-bottom: 3px solid #008fd5;
        cursor: pointer;
        display: inline-block;
        line-height: 20px;
        max-width: ${maxWidth}px;
        overflow: visible;
        padding: 5px;
        position: absolute;
        transition: border-color 0.2s ease, width 0.2s ease, height 0.2s ease;
        white-space: pre-wrap;
        z-index: ${zIndex};
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;

        overflow-wrap: break-word;
        word-wrap: break-word;
        -ms-word-break: break-word;
        word-break: break-word;
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;

        ${isEdited && 'visibility: hidden'}
    `}
`;

export const Textarea = styled.textarea`
    border: none;
    border-right: 1px solid #008fd5;
    border-left: 1px solid #008fd5;
    border-radius: 5px;
    box-shadow: 0px 0px 25px 0px rgba(0, 0, 255, 0.1);
    font-family: inherit;
    font-size: inherit;
    left: -5px;
    line-height: 20px;
    margin: 0;
    overflow: hidden;
    padding: 12px;
    position: absolute;
    resize: none;
    top: -5px;
    visibility: visible;

    overflow-wrap: break-word;
    word-wrap: break-word;
    -ms-word-break: break-word;
    word-break: break-word;
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
    hyphens: auto;
`;
