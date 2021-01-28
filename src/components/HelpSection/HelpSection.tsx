import React from 'react';

import { TutorialItems, TutorialItemType } from './TutorialItems';
import {
    Actions,
    Anchor,
    Flex,
    Link,
    Paragraph,
    SectionContainer,
    SingleAction,
    StickyMenu,
    Title,
    TutorialGif,
} from './HelpSection.styled';

export const HelpSection: React.FC = () => {
    return (
        <SectionContainer id='howto'>
            <StickyMenu>
                <Title size='sectionTitle'>How To</Title>
                <Paragraph margin='0 0 30px'>
                    Each action has description and visualisation showing how it can be performed.
                </Paragraph>

                {TutorialItems.map((item: TutorialItemType) => (
                    <Link href={`#${item.title}`} key={item.title}>
                        {item.title}
                    </Link>
                ))}
            </StickyMenu>
            <Actions>
                {TutorialItems.map((item: TutorialItemType) => (
                    <SingleAction key={item.title}>
                        <Anchor id={item.title} />
                        <Flex padding='30px' column>
                            <Title size='title'>{item.title}</Title>
                            {item.description}
                        </Flex>
                        <TutorialGif src={item.src} alt={`How to: ${item.title}`} />
                    </SingleAction>
                ))}
            </Actions>
        </SectionContainer>
    );
};
