import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import TagForm from '../TagForm';
import './Tag.css';

class Tag extends React.Component {
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
        // Editing tag
        <TagForm
          initialValues={{ tagName }}
          onCancel={() => this.toggleBoolState('showEdit')}
          onSubmit={onEdit}
          tagId={tagId}
          transactionId={transactionId}
        /> :

        // Displaying tag
        <Button.Group className='tag'>
          {/* Button displaying tag name */}
          <Button content={tagName} onClick={() => this.toggleBoolState('showCTAs')} />

          {/* Edit tag - attached button */}
          {showCTAs &&
          <Button className='grouped-button' color='blue' onClick={() => this.toggleBoolState('showEdit')}>
            <Button.Content className='no-padding'>
              <Icon name='edit' className='no-margin' />
            </Button.Content>
          </Button>
          }

          {/* Delete tag - attached button */}
          {showCTAs &&
          <Button className='grouped-button' color='red' onClick={onDelete}>
            <Button.Content className='no-padding'>
              <Icon name='trash' className='no-margin' />
            </Button.Content>
          </Button>
          }
        </Button.Group>
    );
  }
}

export default Tag;
