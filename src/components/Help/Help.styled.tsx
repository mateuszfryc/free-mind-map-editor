import styled, { css } from 'styled-components';
import { TFontSize } from '../../styles/themeDefault';

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
    gap?: string;
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
        gap = '0'
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
        gap: ${gap};
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
        height: 100%;
        width: 100%;
        padding: 0;
    `
);

export const ColumnLeft = styled(Flex)`
    width: 30%;
    padding: 0 30px;
`;

export const ColumnRight = styled(Flex)`
    width: 70%;
`;

export const StickyMenu = styled(Flex)`
    flex-direction: column;
    margin-top: 50px;
`;

export const Actions = styled('div')`
    margin: 30px 0;
    padding-right: 20px;
    height: calc(100vh - 60px);
    max-width: 550px;
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

type TTileProps = {
    display?: string;
    margin?: string;
    maxWidth?: string;
    size?: TFontSize;
}
export const Title = styled.h1<TTileProps>(
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

export const Paragraph = styled.p(
    ({ theme: { colors } }) => css`
        color: ${colors.secondary()};
        padding: 10px 0;
    `
);

export const TutorialGif = styled.img`
    width: auto;
    height: 210px;
`;
