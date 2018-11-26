import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';

const ButtonToModal = ({
  button,
  children,
  id,
  showModal,
}) => (
  <Modal
    className='yaba-modal'
    id={id}
    open={showModal}
    size='tiny'
    trigger={button}
  >
    {children}
  </Modal>
);

ButtonToModal.propTypes = {
  button: PropTypes.node,
  children: PropTypes.node,
  id: PropTypes.string,
  showModal: PropTypes.bool,
};

export default ButtonToModal;
