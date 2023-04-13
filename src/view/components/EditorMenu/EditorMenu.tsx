import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import { SavedStateType } from 'persistance/editor/base-types';
import { ButtonUploadFIle } from 'view/components/ButtonUploadFIle';
import { emptyMindMap } from '../../../persistance/editor/data/empty-mind-map';
import { editorStore } from '../../../persistance/editor/editor-store';
import { Button } from '../Button';
import { ConfirmModal } from '../ConfirmModal';
import { FoldableArea } from '../FoldableArea';
import { ButtonLink } from '../Link';
import * as Styled from './EditorMenu.styled';

const buttonsStyle = {
  border: 'none',
  justifyContent: 'left',
};

const childStyle = {
  width: '100%',
};

export function EditorMenu() {
  const savedMindMap = editorStore.savedMindMap();
  const setDrawLock = editorStore.setDrawLock();
  const deserializeMindMap = editorStore.deserializeMindMap();
  const [isOpen, setIsOpen] = useState(false);

  const startOver = useCallback(() => {
    setIsOpen(true);
  }, []);

  const resetModalButtons = useMemo(
    () => [
      {
        text: 'Cancel',
        onClick: () => {
          setIsOpen(false);
        },
      },
      {
        text: 'Start over',
        onClick: () => {
          deserializeMindMap(emptyMindMap);
          setIsOpen(false);
        },
      },
    ],
    [deserializeMindMap],
  );

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
    <>
      <ConfirmModal
        isOpen={isOpen}
        title='Start over'
        description='It will erase your current mind map. Do you want to continue?'
        buttons={resetModalButtons}
      />
      <Styled.Navigation>
        <FoldableArea buttonContent={<Styled.BurgerIcon />}>
          <FoldableArea.Child onCLickClose style={childStyle}>
            <Button onClick={startOver} style={{ ...buttonsStyle, width: '100%' }}>
              Start over
            </Button>
          </FoldableArea.Child>

          <FoldableArea.Child onCLickClose style={childStyle}>
            <ButtonLink as='a' download='MindMap.json' href={`data: ${savedMindMap}`} style={buttonsStyle}>
              Download current map
            </ButtonLink>
          </FoldableArea.Child>

          <FoldableArea.Child onCLickClose style={childStyle}>
            <ButtonUploadFIle onChange={uploadSavedMindMap} style={buttonsStyle}>
              Upload local file
            </ButtonUploadFIle>
          </FoldableArea.Child>

          <FoldableArea.Child onCLickClose style={childStyle}>
            <ButtonLink to='help' style={buttonsStyle}>
              How to use
            </ButtonLink>
          </FoldableArea.Child>
        </FoldableArea>
      </Styled.Navigation>
    </>
  );
}
