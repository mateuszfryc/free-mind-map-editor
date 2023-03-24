import { ChangeEvent, useCallback, useRef, useState } from 'react';

import { ButtonUploadFIle } from 'components/ButtonUploadFIle';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { SavedStateType } from 'types/baseTypes';
import { useMindMapStore } from '../../stores/mind-map-store';
import { deserializeMindMapSelector, savedMindMapSelector, setDrawLockSelector } from '../../stores/selectors';
import * as Styled from './Navigation.styled';

export function Navigation() {
  const savedMindMap = useMindMapStore(savedMindMapSelector);
  const setDrawLock = useMindMapStore(setDrawLockSelector);
  const deserializeMindMap = useMindMapStore(deserializeMindMapSelector);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const stickyMenuRef = useRef(null);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen((current) => !current);
  }, []);

  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useOnClickOutside(stickyMenuRef, closeMenu);

  const uploadSavedMindMap = useCallback(
    (event: ChangeEvent): void => {
      const target = event.target as HTMLInputElement;

      if (target && target.files && target.files.length > 0) {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          const payload = reader.result as string;

          if (payload && typeof payload === 'string') {
            const result: SavedStateType = JSON.parse(payload) as SavedStateType;
            setDrawLock(true);
            deserializeMindMap(result);
          }
        });

        reader.readAsText(target.files[0]);
      }
    },
    [deserializeMindMap, setDrawLock],
  );

  return (
    <Styled.Navigation ref={stickyMenuRef}>
      <Styled.MenuButton type='button' onClick={toggleMobileMenu}>
        <Styled.BurgerIcon isActive={isMenuOpen} />
      </Styled.MenuButton>

      <Styled.LinksContainer isOpen={isMenuOpen}>
        <Styled.Link onClick={closeMenu} to='/'>
          Editor
        </Styled.Link>

        <Styled.Link as='a' subLink onClick={closeMenu} download='MindMap.json' href={`data: ${savedMindMap}`}>
          Save
        </Styled.Link>

        <Styled.Link as='a' subLink onClick={closeMenu} padding='0'>
          <ButtonUploadFIle onChange={uploadSavedMindMap}>Upload</ButtonUploadFIle>
        </Styled.Link>

        <Styled.Link onClick={closeMenu} to='help' margin='20px 0 0'>
          How To
        </Styled.Link>
      </Styled.LinksContainer>
    </Styled.Navigation>
  );
}
