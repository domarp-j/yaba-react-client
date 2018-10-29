import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import TagForm from '../TagForm';

class TagButton extends React.Component {
  static propTypes = {
    detachTagFromTransaction: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    tagId: PropTypes.number,
    tagName: PropTypes.string,
    transactionId: PropTypes.number,
  }

  constructor() {
    super();
    this.state = {
      showCTAs: false,
      showEdit: false,
    };
  }

  toggleBoolState = stateKey => this.setState(prevState => {
    return {
      [stateKey]: !prevState[stateKey],
    };
  })

  render() {
    const { onDelete, onEdit, tagId, tagName, transactionId } = this.props;
    const { showCTAs, showEdit } = this.state;

    return (
      showEdit ?
        <TagForm
          initialValues={{ tagName }}
          onCancel={() => this.toggleBoolState('showEdit')}
          onSubmit={onEdit}
          tagId={tagId}
          transactionId={transactionId}
        /> :
        <Button.Group>
          <Button
            className={`yaba-tag-button ${showCTAs ? 'with-edit' : ''}`}
            content={tagName}
            onClick={() => this.toggleBoolState('showCTAs')}
          />
          {showCTAs &&
            <Button
              className='yaba-tag-edit'
              color='blue'
              onClick={() => this.toggleBoolState('showEdit')}
            >
              <Button.Content>
                <Icon name='edit' className='no-margin' />
              </Button.Content>
            </Button>
          }
          {showCTAs &&
            <Button
              className='yaba-tag-delete'
              color='red'
              onClick={onDelete}
            >
              <Button.Content>
                <Icon name='trash' className='no-margin' />
              </Button.Content>
            </Button>
          }
        </Button.Group>
    );
  }
}

export default TagButton;
