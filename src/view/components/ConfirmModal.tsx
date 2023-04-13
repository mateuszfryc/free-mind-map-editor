import { Button } from './Button';
import { Flex, Title } from './Help/Help.styled';
import { Modal } from './Modal';

export type ModalButton = {
  text: string;
  onClick: () => void;
};

export type ConfirmModalProps = {
  isOpen?: boolean;
  title?: string;
  description?: string;
  buttons: ModalButton[];
};

export function ConfirmModal({
  buttons,
  isOpen = false,
  title = undefined,
  description = undefined,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen}>
      {title && <Title size='itemTitle'>Start over</Title>}
      {description && <div>It will erase your current mind map. Do you want to continue?</div>}
      <Flex justify='right' width='100%' margin='20px 0 0' gap='10px'>
        {buttons.map(({ text, onClick }) => (
          <Button key={`button-${text}`} onClick={onClick}>
            {text}
          </Button>
        ))}
      </Flex>
    </Modal>
  );
}
