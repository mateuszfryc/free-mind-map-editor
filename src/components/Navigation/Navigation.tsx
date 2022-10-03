import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useContext, useRef, useState } from 'react';

import { ButtonUploadFIle } from 'components/ButtonUploadFIle';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import storeContext from 'stores/globalStore';
import { SavedStateType } from 'types/baseTypes';
import * as Styled from './Navigation.styled';

export const Navigation: React.FC = observer(() => {
    const store = useContext(storeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const stickyMenuRef = useRef(null);

    const toggleMobileMenu = useCallback(() => {
        setIsMenuOpen((current) => !current);
    }, []);

    const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

    useOnClickOutside(stickyMenuRef, handleCloseMenu);

    const uploadSavedMindMap = (event: ChangeEvent): void => {
        const target = event.target as HTMLInputElement;
        if (target && target.files && target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const payload = reader.result as string;
                if (payload && typeof payload === 'string') {
                    const result: SavedStateType = JSON.parse(payload);
                    store.isDrawingLocked = true;
                    store.loadUploadedMindMap(result);
                }
            });

            reader.readAsText(target.files[0]);
        }
    };

    return (
        <Styled.Navigation ref={stickyMenuRef}>
            <Styled.MenuButton type='button' onClick={toggleMobileMenu}>
                <Styled.BurgerIcon isActive={isMenuOpen} />
            </Styled.MenuButton>

            <Styled.LinksContainer isOpen={isMenuOpen}>
                <Styled.Link onClick={handleCloseMenu} href='#mindmap'>
                    Editor
                </Styled.Link>

                <Styled.Link
                    subLink
                    onClick={handleCloseMenu}
                    download='MindMap.json'
                    href={`data: ${store.savedMindMap}`}
                >
                    Save
                </Styled.Link>

                <Styled.Link subLink onClick={handleCloseMenu} padding='0'>
                    <ButtonUploadFIle onChange={uploadSavedMindMap}>Upload</ButtonUploadFIle>
                </Styled.Link>

                <Styled.Link onClick={handleCloseMenu} href='#howto' margin='20px 0 0'>
                    How To
                </Styled.Link>
            </Styled.LinksContainer>
        </Styled.Navigation>
    );
});
