import { MutableRefObject, useRef } from 'react';

import { addClass, removeClass } from '../../utils/dom';
import { ButtonLink } from '../Link';
import {
  Actions,
  Anchor,
  ColumnLeft,
  ColumnRight,
  Flex,
  Link,
  Paragraph,
  SectionContainer,
  SingleAction,
  StickyMenu,
  Title,
  TutorialGif,
} from './Help.styled';
import { TutorialItemType, TutorialItems } from './TutorialItems';

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
      <ColumnLeft style={{ justifyContent: 'right' }}>
        <StickyMenu>
          <ButtonLink to='/' style={{ marginBottom: '40px' }}>
            Back to editor
          </ButtonLink>
          <Title size='sectionTitle'>How To</Title>
          <Paragraph>Each action below has a description and visualisation showing how it can be performed.</Paragraph>

          <Flex style={{ marginTop: '20px', flexDirection: 'column' }}>
            {TutorialItems.map((item: TutorialItemType) => (
              <Link href={`#${item.title}`} key={item.title} onClick={() => setHighlight(item.title)}>
                {item.title}
              </Link>
            ))}
          </Flex>
        </StickyMenu>
      </ColumnLeft>

      <ColumnRight style={{ justifyContent: 'left', overflowX: 'hidden', overflowY: 'scroll' }}>
        <Actions>
          {TutorialItems.map((item: TutorialItemType) => (
            <SingleAction key={item.title} ref={actionsRefs[item.title]}>
              <Anchor id={item.title} />
              <Flex padding='20px' column>
                <Title size='subtitle'>{item.title}</Title>
                {item.description}
              </Flex>
              <TutorialGif src={item.src} alt={`How to: ${item.title}`} />
            </SingleAction>
          ))}
        </Actions>
      </ColumnRight>
    </SectionContainer>
  );
}
