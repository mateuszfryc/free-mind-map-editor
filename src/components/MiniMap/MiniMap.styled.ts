import styled from 'styled-components';

export const MiniMap = styled.div`
    background: rgba(50, 100, 255, 0.1);
    border: 1px solid $primary;
    bottom: 15px;
    height: 300px;
    position: absolute;
    right: 15px;
    width: 300px;
    z-index: 4;
`;

export const MiniMapViewport = styled.div`
    background: rgba(50, 100, 255, 0.1);
    border: 1px solid $primary;
    bottom: 15px;
    height: 50px;
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    z-index: 5;
`;
