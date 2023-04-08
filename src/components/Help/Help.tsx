import { MutableRefObject, useRef } from 'react';

import { addClass, removeClass } from 'utils/dom';
import { ButtonLink } from '../Link';
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
} from './Help.styled';
import { TutorialItems, TutorialItemType } from './TutorialItems';

export function Help() {
  const actionsRefs: { [key: string]: MutableRefObject<null> } = {};
  TutorialItems.forEach((item: TutorialItemType): void => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    actionsRefs[item.title] = useRef(null);
  });

  const setHighlight = (id: string): void => {
    const fadeBackgroundClass = 'fading-highlight';

    const ref: HTMLLinkElement | null = actionsRefs[id].current;
    if (ref !== null) {
      addClass(ref, fadeBackgroundClass);

      setTimeout(() => {
        removeClass(ref, fadeBackgroundClass);
      }, 300);
    }
  };

  return (
    <SectionContainer id='howto'>
      <StickyMenu>
        <ButtonLink to='/' style={{ marginBottom: '20px' }}>
          Back to editor
        </ButtonLink>
        <Title size='sectionTitle'>How To</Title>
        <Paragraph margin='0 0 30px'>
          Each action has description and visualisation showing how it can be performed.
        </Paragraph>

        {TutorialItems.map((item: TutorialItemType) => (
          <Link href={`#${item.title}`} key={item.title} onClick={() => setHighlight(item.title)}>
            {item.title}
          </Link>
        ))}
      </StickyMenu>
      <Actions>
        {TutorialItems.map((item: TutorialItemType) => (
          <SingleAction key={item.title} ref={actionsRefs[item.title]}>
            <Anchor id={item.title} />
            <Flex padding='30px' column>
              <Title size='paragraph'>{item.title}</Title>
              {item.description}
            </Flex>
            <TutorialGif src={item.src} alt={`How to: ${item.title}`} />
          </SingleAction>
        ))}
      </Actions>
    </SectionContainer>
  );
}
