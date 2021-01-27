import React, { ChangeEvent } from 'react';

import * as Styled from './ButtonUploadFIle.styled';

type ButtonUploadFIleProps = {
    onChange: (event: ChangeEvent) => void;
};

export const ButtonUploadFIle: React.FC<ButtonUploadFIleProps> = ({ children, onChange }) => {
    return (
        <Styled.Wrapper>
            <Styled.Label htmlFor="fileInputGroup01">
                {children}
                <Styled.Input accept="application/json" id="fileInputGroup01" onChange={onChange} type="file" />
            </Styled.Label>
        </Styled.Wrapper>
    );
};
