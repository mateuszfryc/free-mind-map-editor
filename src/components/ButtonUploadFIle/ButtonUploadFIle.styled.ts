import styled from 'styled-components';
import { ButtonStyle } from '../Button';

export const Wrapper = styled.div`
    height: 32px;
    position: relative;
`;

export const Label = styled.label(ButtonStyle)

export const Input = styled.input`
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    visibility: hidden;
    width: 100%;
`;
