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

export const Link = styled.a<{ padding?: string }>(
    ({ padding = '8px 15px', theme: { colors } }) => css`
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
    `
);

export const LinksContainer = styled.div<{ isOpen: boolean }>(
    ({ isOpen, theme: { colors } }) => css`
        align-items: flex-start;
        background-color: ${colors.primary()};
        color: ${colors.secondary()};
        display: flex;
        flex-direction: column;
        height: 0;
        justify-content: center;
        left: 20px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        top: 20px;
        transition: width 0.3s ease, height 0.3s ease, padding 0.3s ease;
        width: 0;

        ${isOpen && css`
            height: initial;
            padding: 20px;
            width: max-content;
        `}
    `
);

export const MenuButton = styled.button(
    ({ theme: { colors } }) => css`
        align-items: center;
        background-color: ${colors.primary()};
        border: 2px solid ${colors.shade()};
        border-radius: 50%;
        color: ${colors.secondary()};
        cursor: pointer;
        display: flex;
        height: 41px;
        justify-content: center;
        padding: 10px;
        transition: background-color 0.3s ease, color 0.3s ease;
        z-index: 11;
    `
);

export const BurgerIcon = styled.span<{ isActive?: boolean }>(
    ({ isActive = false, theme: { colors } }) => css`
        background-color: ${isActive ? 'transparent' : colors.secondary()};
        position: relative;

        &,
        &::before,
        &::after {
            border-radius: 5px;
            content: '';
            height: 3px;
            transition: all 0.3s ease-out;
            width: 20px;
        }

        &::before,
        &::after {
            background-color: ${colors.secondary()};
            left: 0;
            position: absolute;
        }

        &::before {
            top: ${isActive ? '0' : '-8px'};
            transform: ${isActive ? 'rotate(45deg)' : 'none'};
        }

        &::after {
            top: ${isActive ? '0' : '8px'};
            transform: ${isActive ? 'rotate(135deg)' : 'none'};
        }
    `
);
