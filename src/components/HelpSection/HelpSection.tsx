import React from 'react';

import SelectGif from 'assets/tutorial/select.gif';
import EditGif from 'assets/tutorial/edit.gif';
import MoveSingletToughtGif from 'assets/tutorial/movesinglethought.gif';
import MoveWithoutChildrenGif from 'assets/tutorial/dragalone.gif';
import MakeChildGif from 'assets/tutorial/makechild.gif';
import MakeSiblingGif from 'assets/tutorial/makesibling.gif';
import ReparentGif from 'assets/tutorial/reparent.gif';
import DragViewportdGif from 'assets/tutorial/dragviewport.gif';
import MinimapdGif from 'assets/tutorial/minimap.gif';
import { Flex, HelpModalWrapper, Title, TutorialGif, Paragraph } from './HelpSection.styled';

export const HelpSection: React.FC = () => {
    return (
        <HelpModalWrapper>
            <Flex width='100%' maxWidth='920px' padding='100px' column id='howto'>
                <Title size='sectionTitle'>Free Mindmap How To</Title>
                <Paragraph margin='0 0 100px'>Easy and quick way to make map of yout thoughts.</Paragraph>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Select</Title>
                        To select single thought click on it once with mouse/touchpad.
                    </Flex>
                    <TutorialGif src={SelectGif} alt='How to: select' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Edit</Title>
                        To edit single thought you can either double click on it with mouse/touchpad or when the thought
                        is selected hit Space on the keyboard.
                    </Flex>
                    <TutorialGif src={EditGif} alt='How to: edit' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Drag single thought around</Title>
                        Click and hold to drag single thought around.
                    </Flex>
                    <TutorialGif src={MoveSingletToughtGif} alt='How to: drag single thoughts around' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Drag thought without children</Title>
                        To drag thought without its children hold Shift on keyboard and than drag it.
                    </Flex>
                    <TutorialGif src={MoveWithoutChildrenGif} alt='How to: drag thought without children' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Make child thought</Title>
                        To create new child thought hit Tab on the keyboard while the parent is selected.
                    </Flex>
                    <TutorialGif src={MakeChildGif} alt='How to: make child' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Make sibling thought</Title>
                        To create sibling thought hit Enter on the keyboard while the thought is selected.
                    </Flex>
                    <TutorialGif src={MakeSiblingGif} alt='How to: make child' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Attach child to another thought</Title>
                        Click and hold mouse button to drag and drop thoughts to new parents.
                    </Flex>
                    <TutorialGif src={ReparentGif} alt='How to: reparent thought' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Drag the viewport</Title>
                        Click and hold with mouse/touchpad on the background to move the viewport around.
                    </Flex>
                    <TutorialGif src={DragViewportdGif} alt='How to: select' />
                </Flex>

                <Flex margin='0 0 30px'>
                    <Flex padding='30px' wrap='wrap'>
                        <Title size='title'>Move viewport with mini map</Title>
                        Click and hold on the viewport miniature on mini map to drag the viewport. You can also just
                        click on the mini map to quickly jump to selected area.
                    </Flex>
                    <TutorialGif src={MinimapdGif} alt='How to: drag viewport with mini map' />
                </Flex>
            </Flex>
        </HelpModalWrapper>
    );
};
