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

export const Container = styled.div<{ isOpen: boolean }>(
    ({ isOpen, theme: { colors } }) => css`
        align-items: flex-start;
        box-shadow: 0 0 7px ${colors.shade(0.3)};
        background-color: ${colors.primary()};
        border: 1px solid ${colors.shade(0.3)};
        color: ${colors.secondary()};
        display: flex;
        border-radius: 6px;
        opacity: ${isOpen ? 1 : 0};
        flex-direction: column;
        height: 0;
        justify-content: center;
        left: 45px;
        overflow: hidden;
        padding: 0;
        transition: width 0.3s ease, height 0.3s ease, padding 0.3s ease;
        width: 0;
        margin-top: 10px;
        ${isOpen && css`
            height: initial;
            padding: 10px;
            width: max-content;
        `}
    `
);

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
        transition: background-color 0.3s ease;

        &:hover,
        &:focus {
            background-color: ${colors.shade(0.25)};
        }

        ${subLink && css`
            margin-left: 30px !important;
        `}
    `
);

export const MenuButton = styled.button<{ primary?: boolean }>(
    ({ theme: { colors }, primary = false }) => css`
        align-items: center;
        background-color: ${primary ? colors.primaryDarker() : 'transparent'};
        border: 1px solid ${primary ? 'transparent' : colors.shade(0.7)};
        border-radius: 6px;
        color: ${primary ? colors.primary() : colors.secondary()};
        cursor: pointer;
        display: flex;
        height: 37px;
        justify-content: center;
        padding: 10px;
        transition: background-color 0.15s ease, color 0.15s ease;
        z-index: 11;

        &:hover,
        &:focus {
            background-color: ${primary ? colors.primaryDarker(0.7) : colors.shade(0.25)};
        }
    `
);

export const BurgerIcon = styled.span<{ isActive?: boolean }>(
    ({ isActive = false, theme: { colors } }) => css`
        background-color: ${isActive ? 'transparent' : colors.secondary(0.8)};
        position: relative;

        &,
        &::before,
        &::after {
            content: '';
            height: 2.5px;
            transition: all 0.3s ease-out;
            width: 16px;
        }

        &::before,
        &::after {
            background-color: ${colors.secondary(0.8)};
            left: 0;
            position: absolute;
        }

        &::before {
            top: ${isActive ? '0' : '-6px'};
            transform: ${isActive ? 'rotate(45deg)' : 'none'};
        }

        &::after {
            top: ${isActive ? '0' : '6px'};
            transform: ${isActive ? 'rotate(135deg)' : 'none'};
        }
    `
);
