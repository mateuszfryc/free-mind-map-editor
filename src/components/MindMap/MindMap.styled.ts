import styled from 'styled-components';
import { ButtonLink } from '../Link';

export const MindMapContainer = styled.div`
    height: 100%;
    overflow: hidden;
    position: relative;
    width: 100%;
`;

export const Canvas = styled.canvas`
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

export const HelpButton = styled(ButtonLink)`
    position: fixed;
    left: 10px;
    bottom: 10px;
    z-index: 2;
`;
