import React, { ChangeEvent, useContext } from 'react';
import { observer } from 'mobx-react';

import storeContext from 'stores/globalStore';
import { ButtonUploadFIle } from 'components/ButtonUploadFIle';
import { SavedStateType } from 'types/baseTypes';
import * as Styled from './Navigation.styled';

export const Navigation: React.FC = observer(() => {
    const store = useContext(storeContext);

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
        <Styled.Navigation>
            <Styled.Link download='MindMap.json' href={`data: ${store.savedMindMap}`}>
                Save
            </Styled.Link>

            <Styled.Link padding='0'>
                <ButtonUploadFIle onChange={uploadSavedMindMap}>Upload</ButtonUploadFIle>
            </Styled.Link>

            <Styled.Link href='#howto'>How To</Styled.Link>

            {/* <Styled.Link>Settings</Styled.Link> */}
        </Styled.Navigation>
    );
});
