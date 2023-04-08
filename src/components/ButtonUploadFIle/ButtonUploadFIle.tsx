import { ChangeEvent } from 'react';

import * as Styled from './ButtonUploadFIle.styled';

type ButtonUploadFIleProps = {
  onChange: (event: ChangeEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export function ButtonUploadFIle({ children, onChange, style = {} }: ButtonUploadFIleProps) {
  return (
    <Styled.Wrapper>
      <Styled.Label htmlFor='fileInputGroup01' style={style}>
        {children}
      </Styled.Label>
      <Styled.Input accept='application/json' id='fileInputGroup01' onChange={onChange} type='file' />
    </Styled.Wrapper>
  );
}
