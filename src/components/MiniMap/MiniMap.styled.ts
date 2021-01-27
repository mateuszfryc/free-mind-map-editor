import styled, { css } from 'styled-components';

export const MiniMap = styled.div(
    ({ theme: { colors } }) => css`
        background-color: ${colors.baseMiniMap(0.15)};
        border: 1px solid ${colors.baseMiniMap(0.5)};
        bottom: 15px;
        height: 300px;
        position: absolute;
        right: 15px;
        width: 300px;
        z-index: 4;
    `
);

export const MiniMapViewport = styled.div(
    ({ theme: { colors } }) => css`
        background: ${colors.baseMiniMap(0.15)};
        border: 1px solid ${colors.baseMiniMap(0.4)};
        bottom: 15px;
        height: 50px;
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        z-index: 5;
    `
);
