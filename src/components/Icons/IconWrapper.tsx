import React from 'react';

type IconWrapperType = {
    viewBox: string;
};

export const IconWrapper: React.FC<IconWrapperType> = ({ children, viewBox }) => {
    return (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} style={{ cursor: 'pointer' }}>
            {children}
        </svg>
    );
};
