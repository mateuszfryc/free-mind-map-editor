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

export const Flex = styled.div<FlexType>(
    ({
        align = 'flex-start',
        column = false,
        inlie = false,
        justify = 'flex-start',
        margin = '0',
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

export const SectionContainer = styled(Flex)(
    ({
        theme: {
            colors
        },
    }) => css`
        background-color: ${colors.primary()};
        color: ${colors.secondary()};
        justify-content: space-between;
        padding: 100px;
        height: 100%;
        overflow: scroll;
        width: calc(100% - 200px);
    `
);

export const StickyMenu = styled(Flex)`
    flex-direction: column;
    max-width: 350px;
    position: sticky;
    top: 100px;
`;

export const Actions = styled(Flex)`
    flex-direction: column;
    margin: 0;
    justify-content: center;
    max-width: 1200px;
    width: 100%;
`;

export const Anchor = styled.div`
    position: absolute;
    top: -100px;
`;

export const SingleAction = styled(Flex)(
    ({
        theme: {
            colors
        },
    }) => css`
        align-items: center;
        background-color: transparent;
        justify-content: space-between;
        max-width: 1000px;
        padding: 30px;
        position: relative;
        transition: background-color 1s ease;

        &:not(:last-child) {
            border-bottom: 1px solid ${colors.shade()};
        }


        &.fading-highlight {
            transition: none;
            background-color: ${colors.contrast(0.4)};
        }
    `
);

export const Link = styled.a(
    ({
        theme: {
            colors
        },
    }) => css`
        color: ${colors.contrast()};
        text-decoration: none;

        &:hover {
            color: ${colors.secondary()};
        }

        &:not(:last-child) {
            margin-bottom: 5px;
        }
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

export const TutorialGif = styled.img`
    width: 400px;
    height: auto;
`;
