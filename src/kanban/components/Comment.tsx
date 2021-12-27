import * as React from 'react';
import { IoMdTrash } from 'react-icons/io';
import styled from 'styled-components';

import { Comment as CommentModel } from '../models/kanban';
import { Description } from './shared/Description';
import { IconButton } from './shared/IconButton';

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin: 8px;
  :hover {
    background-color: var(--selected-color);
  }
`;

interface Props {
  comment: CommentModel;
  onEnter: (title: string) => void;
  onDelete: (comment: CommentModel) => void;
}

export const Comment: React.VFC<Props> = ({ comment, onEnter, onDelete }) => {
  const [showDeleteButton, setShowDeleteButton] = React.useState(false);

  return (
    <Container
      onMouseOver={() => {
        setShowDeleteButton(true);
      }}
      onMouseLeave={() => {
        setShowDeleteButton(false);
      }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Description
          description={comment.comment ?? ''}
          fontSize="medium"
          onEnter={onEnter}
        />
      </div>
      {showDeleteButton && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: 'var(--text-color)',
          }}>
          <IconButton
            icon={<IoMdTrash />}
            onClick={() => {
              onDelete(comment);
            }}
          />
        </div>
      )}
    </Container>
  );
};
