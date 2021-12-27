import * as React from 'react';
import { MdClose } from 'react-icons/md';
import styled from 'styled-components';

import { Button } from './Button';

const Icon = styled.div`
  background-color: transparent;
  color: var(--text-color);
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  padding: 3px 0 0 8px;
  margin-top: 4px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

interface Props {
  text: string;
  type: 'primary' | 'secondary' | 'danger';
  canClose: boolean;
  onAddClick: () => void;
  onCancel?: () => void;
}

export const AddButton: React.VFC<Props> = ({
  text,
  type,
  canClose,
  onAddClick,
  onCancel,
}) => {
  return (
    <Buttons>
      <Button text={text} type={type} onClick={onAddClick} />
      {canClose ? (
        <Icon
          onClick={(e) => {
            e.stopPropagation();
            if (onCancel) {
              onCancel();
            }
          }}>
          <MdClose />
        </Icon>
      ) : (
        <></>
      )}
    </Buttons>
  );
};
