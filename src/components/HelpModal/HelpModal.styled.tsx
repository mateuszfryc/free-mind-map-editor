import React from 'react';
import styled, { css } from 'styled-components';

type FlexType = {
    align?: string;
    column?: boolean;
    inlie?: boolean;
    justify?: string;
    margin?: string;
    maxWidth?: string;
    padding?: string;
    reverse?: boolean;
    width?: string;
    wrap?: string;
};

export const HelpModalWrapper = styled.div(
    ({ theme: { colors } }) => css`
        background-color: ${colors.primary()};
        bottom: 0;
        color: ${colors.white()};
        left: 64px;
        position: fixed;
        right: 0;
        top: 0;
        padding: 40px;
        overflow-x: hidden;
        overflow-y: scroll;
        z-index: 5;
    `
);

export const Title = styled(({ as, children, ...props }) => (
    <h1 as={as} {...props}>
        {children}
    </h1>
))(
    ({
        display = 'block',
        margin = '0 0 10px',
        maxWidth = 'initial',
        size = 'title',
        theme: { colors, setFontSize },
    }) => css`
        ${setFontSize(size)}

        color: ${colors.white()};
        display: ${display};
        margin: ${margin};
        max-width: ${maxWidth};
    `
);

export const CloseButton = styled.div(
    ({ theme: { colors } }) => css`
        align-items: center;
        border: 1px solid ${colors.white()};
        cursor: pointer;
        display: flex;
        font-size: 20px;
        height: 20px;
        justify-content: center;
        padding: 5px;
        position: absolute;
        right: 20px;
        top: 20px;
        width: 20px;

        &:hover,
        &:focus {
            background-color: ${colors.white()};
            color: ${colors.primary()};
        }

        &:before {
            content: 'x';
        }
    `
);

export const Paragraph = styled.p<{ padding?: string; margin?: string }>(
    ({ padding = '10px 0', margin = '0 0 20px', theme: { colors } }) => css`
        color: ${colors.white()};
        margin: ${margin};
        padding: ${padding};
    `
);

export const Flex = styled.div<FlexType>(
    ({
        align = 'center',
        column = false,
        inlie = false,
        justify = 'flex-start',
        margin = '0 auto',
        maxWidth = 'unset',
        padding = '0',
        reverse = false,
        width = 'unset',
        wrap = 'no-wrap',
    }) => css`
        align-items: ${align};
        display: ${inlie ? 'inline-flex' : 'flex'};
        flex-direction: ${reverse ? (column ? 'column-reverse' : 'row-reverse') : column ? 'column' : 'row'};
        flex-wrap: ${wrap};
        justify-content: ${justify};
        margin: ${margin};
        max-width: ${maxWidth};
        padding: ${padding};
        width: ${width};
    `
);

export const TutorialGif = styled.img`
    width: 400px;
    height: auto;
`;
