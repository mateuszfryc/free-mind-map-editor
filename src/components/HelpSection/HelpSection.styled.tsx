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
        color: ${colors.secondary()};
        width: 100%;
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
        /* stylelint-disable-next-line value-keyword-case */
        ${setFontSize(size)}
        color: ${colors.secondary()};
        display: ${display};
        margin: ${margin};
        max-width: ${maxWidth};
    `
);

export const Paragraph = styled.p<{ padding?: string; margin?: string }>(
    ({ padding = '10px 0', margin = '0 0 20px', theme: { colors } }) => css`
        color: ${colors.secondary()};
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
