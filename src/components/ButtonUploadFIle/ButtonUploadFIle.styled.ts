import styled from 'styled-components';

export const Wrapper = styled.div`
    border-radius: 50%;
    border: none;
    height: 32px;
    position: relative;
    width: 32px;

    &:not(:last-child) {
        margin-bottom: 10px;
    }
`;

export const Label = styled.label`
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;

    & > svg {
        cursor: pointer;
        display: block;
        width: 30px;
        height: auto;
    }
`;

export const Input = styled.input`
    display: block;
    height: 100%;
    width: 100%;
    visibility: hidden;
`;
