import { ChangeEvent, useCallback, useState } from 'react';

import { ButtonUploadFIle } from 'components/ButtonUploadFIle';
import { SavedStateType } from 'types/baseTypes';
import { useMindMapStore } from '../../stores/mind-map-store';
import { deserializeMindMapSelector, savedMindMapSelector, setDrawLockSelector } from '../../stores/selectors';
import { FoldableArea } from '../FoldableArea';
import * as Styled from './Navigation.styled';

export function Navigation() {
  const savedMindMap = useMindMapStore(savedMindMapSelector);
  const setDrawLock = useMindMapStore(setDrawLockSelector);
  const deserializeMindMap = useMindMapStore(deserializeMindMapSelector);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <Styled.Navigation>
      <FoldableArea buttonContent={<Styled.BurgerIcon />}>
        <FoldableArea.Child onCLickClose>
          <Styled.Link to='/'>Editor</Styled.Link>
        </FoldableArea.Child>

        <FoldableArea.Child onCLickClose>
          <Styled.Link as='a' subLink download='MindMap.json' href={`data: ${savedMindMap}`}>
            Download current map
          </Styled.Link>
        </FoldableArea.Child>

        <FoldableArea.Child onCLickClose>
          <Styled.Link as='a' subLink padding='0'>
            <ButtonUploadFIle onChange={uploadSavedMindMap}>Upload local file</ButtonUploadFIle>
          </Styled.Link>
        </FoldableArea.Child>

        <FoldableArea.Child onCLickClose>
          <Styled.Link to='help' margin='20px 0 0'>
            How To
          </Styled.Link>
        </FoldableArea.Child>
      </FoldableArea>
    </Styled.Navigation>
  );
}
