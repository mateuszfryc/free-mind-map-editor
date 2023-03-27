import styled, { css } from 'styled-components';

export const NodesContainer = styled.div(
    ({ theme: { colors, chessboardBackground } }) => css`
        ${chessboardBackground(100, colors.primary(0.02), 'transparent')}
        height: 100%;
        position: absolute;
        width: 100%;
        z-index: 2;
    `
);
