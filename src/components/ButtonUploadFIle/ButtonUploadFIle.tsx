import React, { ChangeEvent } from 'react';

import { IconOpenFile } from 'components/Icons/IconOpenFile';
import * as Styled from './ButtonUploadFIle.styled';

type ButtonUploadFIleProps = {
    onChange: (event: ChangeEvent) => void;
};

export const ButtonUploadFIle: React.FC<ButtonUploadFIleProps> = ({ onChange }) => {
    return (
        <Styled.Wrapper>
            <Styled.Input accept="application/json" id="fileInputGroup01" onChange={onChange} type="file" />
            <Styled.Label htmlFor="fileInputGroup01">
                <IconOpenFile />
            </Styled.Label>
        </Styled.Wrapper>
    );
};
