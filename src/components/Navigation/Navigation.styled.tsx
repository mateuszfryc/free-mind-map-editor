import styled, { css } from 'styled-components';

export const Navigation = styled.header`
    align-items: center;
    display: flex;
    justify-content: center;
    position: fixed;
    top: 0;
    z-index: 10;
`;

export const Link = styled.a<{ padding?: string }>(
({
    padding = '8px 15px',
    theme: {
        colors,
    },
}) => css`
    align-items: center;
    background-color: ${colors.primary()};
    color: ${colors.secondary()};
    cursor: pointer;
    display: flex;
    justify-content: center;
    padding: ${padding};
    text-decoration: none;
    transition: background-color 0.3s ease;

    &:hover,
    &:focus {
        background-color: ${colors.shade()};
    }

    &:not(:last-child) {
        border-right: 1px solid ${colors.shade()};
    }
`);
