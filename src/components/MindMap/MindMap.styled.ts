import styled, { css } from 'styled-components';

export const MindMap = styled.div`
    height: 100%;
    overflow: hidden;
    position: relative;
    width: 100%;
`;

export const Canvas = styled.canvas`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

export const Tools = styled.div`
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    left: 15px;
    position: fixed;
    top: 15px;
    width: 24px;
    z-index: 5;
`;

export const Button = styled.a`
    align-items: center;
    border-radius: 50%;
    border: none;
    display: flex;
    height: 32px;
    justify-content: center;
    width: 32px;

    &:not(:last-child) {
        margin-bottom: 10px;
    }

    & > svg {
        cursor: pointer;
        display: block;
        width: 30px;
        height: auto;
    }
`;
