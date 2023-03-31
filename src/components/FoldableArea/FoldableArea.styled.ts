import styled, { css } from "styled-components";

export const Wrapper = styled.div(
    () => css`
        position: relative;
    `
);

export const Container = styled.div<{ isOpen?: boolean, alignRight?: boolean }>(
    ({ isOpen = false, alignRight = false, theme: { colors } }) => css`
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
        overflow: hidden;
        padding: 0;
        position: absolute;
        transition: width 0.3s ease, height 0.3s ease, padding 0.3s ease;
        width: 0;
        margin-top: 10px;
        right: ${alignRight ? '0' : 'unset'};
        ${isOpen && css`
            height: initial;
            padding: 10px;
            width: max-content;
        `}
    `
);
