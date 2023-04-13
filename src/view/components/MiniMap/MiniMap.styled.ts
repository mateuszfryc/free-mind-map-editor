import styled, { css } from 'styled-components';

export const MiniMap = styled.div(
    ({ theme: { colors } }) => css`
        background-color: ${colors.baseMiniMap(0)};
        border: 1px solid ${colors.baseMiniMap(0.5)};
        box-shadow: 0 0 10px ${colors.baseMiniMap(0.2)};
        bottom: 15px;
        height: 250px;
        position: absolute;
        right: 15px;
        width: 250px;
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
