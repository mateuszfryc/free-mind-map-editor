import styled, { css } from 'styled-components';

type ThoughtStyleType = {
    maxWidth: number;
    isSelected: boolean;
    isEdited: boolean;
    zIndex: number;
};

export const Thought = styled.div<ThoughtStyleType>(
    ({ maxWidth, isSelected, isEdited, zIndex, theme: { colors } }) => css`
        background-color: transparent;
        border: none;
        color: #000;
        cursor: pointer;
        display: inline-block;
        line-height: 20px;
        max-width: ${maxWidth}px;
        outline: none;
        overflow: visible;
        padding: 7px 12px;
        position: absolute;
        user-select: none;
        white-space: pre-wrap;
        z-index: ${zIndex};

        & .underline {
            border-color: ${colors.primary()};
            border-style: solid;
            border-width: 0 0 3px;
            bottom: 0;
            left: 0;
            height: 12px;
            position: absolute;
            transition:
                border-color 0.2s ease,
                border-radius 0.2s ease,
                border-width 0.2s ease,
                bottom 0.2s ease,
                margin 0.2s ease, padding 0.2s ease;
            width: 100%;
            z-index: -1;
        }

        overflow-wrap: break-word;
        word-wrap: break-word;
        -ms-word-break: break-word;
        word-break: break-word;
        hyphens: auto;

        &:hover .underline {
            border-width: 0 0 8px 0;
            bottom: -6px;
        }

        ${isSelected && css`
            & .underline {
                border-radius: 12px;
                padding-bottom: 4px;
                margin-bottom: -3px;
                border-width: 0 0 5px 0;
            }
        `}
        ${isEdited && css`
            visibility: hidden;
        `}
    `
);

export const Textarea = styled.textarea`
    ${({ theme }) => css`
        background-color: transparent;
        border-color: ${theme.colors.primary()};
        border-radius: 12px;
        border-style: solid;
        border-width: 0 0 5px 0;
        font-family: inherit;
        font-size: inherit;
        left: -2px;
        line-height: 20px;
        margin: 0;
        outline: none;
        overflow: hidden;
        padding: 7px 12px;
        position: absolute;
        resize: none;
        top: 1px;
        visibility: visible;

        overflow-wrap: break-word;
        word-wrap: break-word;
        -ms-word-break: break-word;
        word-break: break-word;
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
    `}
`;
