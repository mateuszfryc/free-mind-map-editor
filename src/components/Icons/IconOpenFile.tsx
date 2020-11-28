import React from 'react';

import { IconWrapper } from 'components/Icons/IconWrapper';
import { IconProps } from 'types/baseTypes';
import { colors } from 'styles/themeDefault';

export const IconOpenFile: React.FC<IconProps> = ({ color = colors.defaultIcon() }) => {
    return (
        <IconWrapper viewBox="0 0 16 16">
            <g>
                <path fill={color} d="M14 6v-2h-7l-1-2h-4l-1 2h-1v9.5l3-7.5z" />
                <path fill={color} d="M3.7 7l-3.2 8h12.8l2.5-8z" />
            </g>
        </IconWrapper>
    );
};
