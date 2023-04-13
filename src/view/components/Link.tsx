import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { ButtonProps, ButtonStyle } from './Button';

export const ButtonLink = styled(RouterLink)<ButtonProps>(ButtonStyle);
