import { Link as RouterLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const Navigation = styled.header`
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    left: 15px;
    position: fixed;
    top: 15px;
    z-index: 10;
`;

export const Link = styled(RouterLink)<{ margin?: string, padding?: string, subLink?: boolean }>(
    ({
        margin = '0',
        subLink = false,
        padding = '4px 15px',
        theme: {
            colors
        },
    }) => css`
        align-items: center;
        background-color: ${colors.primary()};
        color: ${colors.secondary()};
        cursor: pointer;
        display: flex;
        justify-content: flex-start;
        margin: ${margin};
        padding: ${padding};
        text-decoration: none;
        transition: background-color 0.1s ease;
        border-radius: 6px;

        &:hover,
        &:focus {
            background-color: ${colors.shade(0.25)};
        }

        ${subLink && css`
            margin-left: 30px !important;
        `}
    `
);

export const BurgerIcon = styled.div<{ isActive?: boolean }>(
    ({ isActive = false, theme: { colors } }) => css`
        background-color: ${isActive ? 'transparent' : colors.secondary(0.8)};
        position: relative;
        margin: 11px 0;

        &,
        &::before,
        &::after {
            height: 2px;
            width: 16px;
        }

        &::before,
        &::after {
            content: '';
            background-color: ${colors.secondary(0.8)};
            left: 0;
            position: absolute;
        }

        &::before {
            top: ${isActive ? '0' : '-6.5px'};
            transform: ${isActive ? 'rotate(45deg)' : 'none'};
        }

        &::after {
            top: ${isActive ? '0' : '6.5px'};
            transform: ${isActive ? 'rotate(135deg)' : 'none'};
        }
    `
);
